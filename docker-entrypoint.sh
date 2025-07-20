#!/bin/sh
set -e

# 🕉️ Divine Container Entrypoint
echo "🕉️ Starting ABCSteps Vivek..."

# Environment validation
required_vars="DATABASE_URL BETTER_AUTH_SECRET OPENROUTER_API_KEY"

for var in $required_vars; do
    if [ -z "$(eval echo \$$var)" ]; then
        echo "❌ Error: Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment validation passed"

# Run database migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "📊 Running database migrations..."
    node -e "console.log('Migration check placeholder - implement with your migration tool')"
fi

# Set Node.js memory limits based on container limits
if [ -f /sys/fs/cgroup/memory/memory.limit_in_bytes ]; then
    CONTAINER_MEMORY=$(cat /sys/fs/cgroup/memory/memory.limit_in_bytes)
    if [ "$CONTAINER_MEMORY" -lt 9223372036854775807 ]; then
        # Reserve 10% for system, use 90% for Node.js
        NODE_MEMORY=$((CONTAINER_MEMORY * 90 / 100 / 1024 / 1024))
        export NODE_OPTIONS="--max-old-space-size=$NODE_MEMORY"
        echo "📈 Set Node.js memory limit to ${NODE_MEMORY}MB"
    fi
fi

# Start the application
echo "🚀 Launching TURYAM state consciousness..."
exec node server.js