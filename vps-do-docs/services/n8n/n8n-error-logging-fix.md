# n8n PostgreSQL Error Logging Fix

## Problem Summary

The n8n workflow "Portal Inmobiliario Direct Scraper" was failing with the following PostgreSQL error:

```
column "error_details" of relation "error_logs" does not exist
```

The failing query was:
```sql
INSERT INTO error_logs (workflow_name, error_message, error_details, severity, occurred_at)
VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
RETURNING id;
```

## Root Cause Analysis

The issue was caused by a mismatch between the n8n workflow's error logging node configuration and the actual database schema. The workflow was attempting to insert data into an `error_details` column that didn't exist in the `error_logs` table.

### Original Schema Issues
- Missing `error_details` column for storing structured error information
- Limited varchar sizes for workflow names and error messages
- Lack of comprehensive error tracking fields (workflow_id, execution_url, etc.)
- Missing indexes for performance optimization

## Solution Overview

The solution involves three main components:

1. **Database Schema Migration** - Add missing columns and improve the table structure
2. **Workflow Enhancement** - Implement robust error handling patterns
3. **Deployment Automation** - Provide scripts for safe migration deployment

## Files Created/Modified

### Database Schema Files
- `/home/gabriel/Documentos/vps-do/scripts/fix-error-logs-schema.sql` - Migration script for existing databases
- `/home/gabriel/Documentos/vps-do/scripts/setup-properties-db.sql` - Updated main schema file
- `/home/gabriel/Documentos/vps-do/scripts/deploy-error-logs-fix.sh` - Deployment automation script

### n8n Workflow Files
- `/home/gabriel/Documentos/vps-do/workflows/n8n-error-handling-improvements.json` - Enhanced error handling patterns
- `/home/gabriel/Documentos/vps-do/docs/n8n-error-logging-fix.md` - This documentation file

## Database Schema Changes

### New Columns Added
```sql
-- Core error logging fields
error_details JSONB                    -- Structured error information
workflow_id VARCHAR(255)               -- n8n workflow identifier
execution_url TEXT                     -- Direct link to execution in n8n
retry_count INTEGER DEFAULT 0          -- Number of retry attempts
node_name VARCHAR(255)                 -- Specific node that failed

-- Enhanced existing columns
workflow_name VARCHAR(500)             -- Increased size for longer names
severity VARCHAR(20)                   -- More flexible severity levels
error_message TEXT                     -- Unlimited error message length
```

### New Indexes
```sql
CREATE INDEX idx_error_logs_workflow_id ON error_logs(workflow_id);
CREATE INDEX idx_error_logs_node_name ON error_logs(node_name);
CREATE INDEX idx_error_logs_retry_count ON error_logs(retry_count);
CREATE INDEX idx_error_logs_error_details ON error_logs USING GIN(error_details);
```

### Enhanced Views
- `error_stats` - Comprehensive error statistics with retry analysis
- `error_report` - Human-readable error reporting with formatted JSON details

## Deployment Instructions

### Prerequisites
- PostgreSQL client tools (`psql`) installed
- Database connection credentials
- Backup storage location available

### Step 1: Prepare Environment Variables
```bash
export DB_HOST="localhost"        # or your database host
export DB_PORT="5432"            # or your database port
export DB_NAME="n8n"             # or your database name
export DB_USER="n8n_user"        # or your database user
export DB_PASSWORD="your_password"
```

### Step 2: Run the Migration
```bash
# For existing databases - apply the migration
cd /home/gabriel/Documentos/vps-do
./scripts/deploy-error-logs-fix.sh

# For new databases - use the updated schema
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/setup-properties-db.sql
```

### Step 3: Verify the Migration
```bash
# Check the deployment was successful
./scripts/deploy-error-logs-fix.sh --dry-run
```

## n8n Workflow Improvements

### Enhanced Error Data Collection
The improved error handling pattern collects comprehensive error information:

```javascript
{
  error: $json.error,
  statusCode: $json.statusCode,
  timestamp: new Date().toISOString(),
  url: $('HTTP Request - Direct Scrape').item.json.url,
  userAgent: "...",
  nodeData: {
    name: $('HTTP Request - Direct Scrape').name,
    type: $('HTTP Request - Direct Scrape').type,
    version: $('HTTP Request - Direct Scrape').typeVersion
  },
  retryAttempt: $('Initialize Variables').item.json.retryCount || 0,
  executionMode: $execution.mode,
  workflowActive: $workflow.active
}
```

### Intelligent Error Classification
Errors are automatically classified by type and severity:

```javascript
// Error Type Classification
$json.statusCode === 403 ? 'FORBIDDEN' :
$json.statusCode === 429 ? 'RATE_LIMITED' :
$json.statusCode === 404 ? 'NOT_FOUND' :
$json.statusCode >= 500 ? 'SERVER_ERROR' :
$json.statusCode >= 400 ? 'CLIENT_ERROR' :
'HTTP_REQUEST_FAILED'

// Severity Classification
$json.statusCode >= 500 ? 'HIGH' :
($json.statusCode === 403 || $json.statusCode === 429) ? 'MEDIUM' :
($json.statusCode >= 400) ? 'LOW' :
'UNKNOWN'
```

### Smart Retry Logic
The enhanced workflow includes intelligent retry logic:

- **Rate Limiting**: 60-second wait for 429 errors
- **Server Errors**: 30-second wait for 5xx errors
- **Exponential Backoff**: Progressive delays for other retryable errors
- **Retry Limits**: Maximum 3 retry attempts with tracking

## Monitoring and Maintenance

### Error Statistics Query
```sql
-- View comprehensive error statistics
SELECT * FROM error_stats
ORDER BY error_count DESC
LIMIT 10;
```

### Error Details Analysis
```sql
-- Analyze specific error patterns
SELECT
    error_type,
    severity,
    jsonb_pretty(error_details)
FROM error_logs
WHERE occurred_at >= CURRENT_DATE - INTERVAL '24 hours'
ORDER BY occurred_at DESC;
```

### Cleanup Old Logs
```sql
-- Clean logs older than 30 days
SELECT clean_old_error_logs(30);
```

## Best Practices for n8n Error Handling

### 1. Comprehensive Error Data
Always collect:
- Execution context (`$execution.id`, `$execution.url`)
- Workflow metadata (`$workflow.id`, `$workflow.active`)
- Node-specific information
- Retry attempt numbers
- Timestamp and environment details

### 2. Error Classification
Implement consistent error typing:
- By HTTP status code
- By error source (network, parsing, validation)
- By severity level (HIGH, MEDIUM, LOW)
- By retry eligibility

### 3. Retry Strategy
- Only retry recoverable errors
- Implement exponential backoff
- Respect rate limits with appropriate delays
- Track retry attempts for analysis

### 4. Database Design
- Use JSONB for structured error details
- Index frequently queried fields
- Implement cleanup procedures
- Create views for common queries

## Testing the Fix

### 1. Database Connection Test
```bash
# Test database connectivity
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();"
```

### 2. Schema Verification
```sql
-- Verify error_details column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'error_logs'
AND column_name = 'error_details';
```

### 3. n8n Query Test
```sql
-- Test the exact query from n8n workflow
INSERT INTO error_logs (workflow_name, error_message, error_details, severity, occurred_at)
VALUES ('TEST', 'Test message', '{"test": true}'::jsonb, 'LOW', CURRENT_TIMESTAMP)
RETURNING id;
```

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure database user has INSERT/UPDATE permissions on error_logs table
   - Grant USAGE on sequences if needed

2. **Connection Issues**
   - Verify n8n PostgreSQL credentials match database settings
   - Check network connectivity between n8n and database

3. **JSON Format Errors**
   - Ensure error_details is valid JSON before insertion
   - Use `::jsonb` casting for explicit type conversion

### Rollback Procedure
If migration causes issues:

1. Restore from backup:
   ```bash
   psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < backups/error_logs_backup_*.sql
   ```

2. Remove new columns (if needed):
   ```sql
   ALTER TABLE error_logs DROP COLUMN IF EXISTS error_details;
   -- Drop other new columns as needed
   ```

## Performance Considerations

### Index Usage
The migration adds several indexes to improve query performance:
- GIN index on `error_details` for JSON queries
- B-tree indexes on frequently filtered columns
- Composite indexes for common query patterns

### Storage Optimization
- JSONB provides efficient storage and indexing for error details
- Regular cleanup prevents unbounded table growth
- Partitioning can be considered for high-volume environments

## Security Considerations

- Error details may contain sensitive information
- Implement appropriate access controls on error_logs table
- Consider data retention policies for compliance
- Sanitize error messages if needed for logging

## Support and Maintenance

For ongoing support:
1. Monitor error patterns using the error_stats view
2. Set up alerting for HIGH severity errors
3. Review retry patterns weekly
4. Clean old logs monthly using the cleanup function
5. Update error classification logic as needed

This solution provides a robust foundation for error logging in n8n workflows while maintaining performance and providing comprehensive debugging information.