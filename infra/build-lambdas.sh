#!/bin/bash
# Build script: packages each API service Lambda with shared lib and dependencies
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"
BUILD_DIR="$SCRIPT_DIR/../.build/lambdas"
SERVICES="auth curriculum content assessment progress admin"
PIPELINE_TASKS="research_task content_quiz_task store_results_task"

rm -rf "$BUILD_DIR"

for svc in $SERVICES; do
    echo "📦 Packaging $svc..."
    SVC_BUILD="$BUILD_DIR/$svc"
    mkdir -p "$SVC_BUILD"

    # Install pip deps for Lambda (Linux ARM64)
    pip install aws-lambda-powertools "pydantic[email]" boto3 ulid-py \
      -t "$SVC_BUILD" --quiet --upgrade \
      --platform manylinux2014_aarch64 \
      --implementation cp \
      --python-version 3.12 \
      --only-binary=:all:

    # Copy service files as a package (so `from auth import service` works)
    mkdir -p "$SVC_BUILD/$svc"
    cp "$BACKEND_DIR/api/$svc/"*.py "$SVC_BUILD/$svc/"
    # Also copy any non-py files (e.g. categories.json)
    find "$BACKEND_DIR/api/$svc/" -maxdepth 1 -not -name "*.py" -not -name "__pycache__" -not -type d -exec cp {} "$SVC_BUILD/$svc/" \; 2>/dev/null || true
    touch "$SVC_BUILD/$svc/__init__.py"

    # Copy shared library
    cp -r "$BACKEND_DIR/shared" "$SVC_BUILD/shared"
    # Remove __pycache__
    find "$SVC_BUILD" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

    echo "  ✅ $svc -> $SVC_BUILD"
done

echo ""
echo "--- Pipeline Tasks ---"
for task in $PIPELINE_TASKS; do
    echo "📦 Packaging pipeline/$task..."
    TASK_BUILD="$BUILD_DIR/pipeline_$task"
    mkdir -p "$TASK_BUILD"

    pip install "pydantic[email]" boto3 \
      -t "$TASK_BUILD" --quiet --upgrade \
      --platform manylinux2014_aarch64 \
      --implementation cp \
      --python-version 3.12 \
      --only-binary=:all:

    # Copy the task handler
    cp "$BACKEND_DIR/pipeline/$task.py" "$TASK_BUILD/handler.py"

    # Copy agents and shared libraries
    cp -r "$BACKEND_DIR/agents" "$TASK_BUILD/agents"
    cp -r "$BACKEND_DIR/shared" "$TASK_BUILD/shared"

    find "$TASK_BUILD" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    echo "  ✅ pipeline/$task -> $TASK_BUILD"
done

echo ""
echo "All Lambda packages built in $BUILD_DIR"
