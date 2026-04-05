# Export/Import Data Feature

## Overview
This feature allows users to backup and restore their financial data by exporting transactions to JSON files and importing them back.

## Backend Implementation

### Files Created/Modified:
1. `backend/src/controller/dataController.ts` - Handles export/import logic
2. `backend/src/routes/dataRoutes.ts` - API routes for data management
3. `backend/src/server.ts` - Registered data routes

### API Endpoints:

#### 1. Export Data
- **Endpoint:** `GET /api/data/export`
- **Authentication:** Required (Bearer token)
- **Response:** JSON file download with all user transactions

**Example Response:**
```json
{
  "version": "1.0",
  "exportedAt": "2026-02-04T20:30:00.000Z",
  "user": {
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com"
  },
  "transactions": [
    {
      "_id": "...",
      "category": "Food",
      "amount": 50,
      "date": "2026-02-04T10:00:00.000Z",
      "name": "Lunch",
      "type": "expense"
    }
  ],
  "statistics": {
    "totalTransactions": 10,
    "totalIncome": 5000,
    "totalExpense": 2500
  }
}
```

#### 2. Import Data
- **Endpoint:** `POST /api/data/import`
- **Authentication:** Required (Bearer token)
- **Query Parameters:** 
  - `clear=true` (optional) - Clear existing data before import
- **Body:** JSON export data

**Success Response:**
```json
{
  "message": "Data imported successfully",
  "importedCount": 10,
  "statistics": {
    "totalTransactions": 10,
    "totalIncome": 5000,
    "totalExpense": 2500
  }
}
```

#### 3. Preview Import Data
- **Endpoint:** `POST /api/data/import/preview`
- **Authentication:** Required (Bearer token)
- **Body:** JSON export data
- **Purpose:** Show statistics before actually importing

**Preview Response:**
```json
{
  "message": "Import preview generated",
  "statistics": {
    "totalTransactions": 10,
    "totalIncome": 5000,
    "totalExpense": 2500,
    "dateRange": {
      "earliest": "2026-01-01T00:00:00.000Z",
      "latest": "2026-02-04T00:00:00.000Z"
    },
    "categories": ["Food", "Transport", "Salary"]
  },
  "sampleTransactions": [...]
}
```

## Frontend Implementation

### Files Created/Modified:
1. `frontend/src/pages/exportImport.tsx` - Main export/import component
2. `frontend/src/pages/profile.tsx` - Added Data Management section
3. `frontend/src/pages/CSS_primary/profile.css` - Styles for export/import UI

### Features:

#### Export Functionality:
- ✅ Download all transactions as JSON file
- ✅ Automatic filename with current date
- ✅ Includes transaction statistics
- ✅ Secure (requires authentication)

#### Import Functionality:
- ✅ Upload JSON backup files
- ✅ Preview data before importing
- ✅ Show statistics (total transactions, income, expense)
- ✅ Option to clear existing data before import
- ✅ Validation of import data format
- ✅ Error handling for invalid files

### User Flow:

1. **Export Data:**
   - Go to Profile page
   - Click "Export / Import Data" button
   - Click "📥 Export Data"
   - File downloads automatically

2. **Import Data:**
   - Go to Profile page
   - Click "Export / Import Data" button
   - Click "📤 Choose Backup File"
   - Select JSON file
   - Review preview statistics
   - Optionally check "Clear existing data"
   - Click "✅ Confirm Import"
   - Page reloads to show imported data

## Security Considerations:

1. **Authentication Required:** All endpoints require valid JWT token
2. **User Isolation:** Users can only export/import their own data
3. **Data Validation:** Import validates JSON structure and required fields
4. **Version Control:** Checks data version compatibility

## Testing:

### Test Export:
```bash
curl -X GET http://localhost:5000/api/data/export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o backup.json
```

### Test Import:
```bash
curl -X POST http://localhost:5000/api/data/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @backup.json
```

### Test Preview:
```bash
curl -X POST http://localhost:5000/api/data/import/preview \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @backup.json
```

## Usage in Production:

1. **Backend:** Ensure CORS allows your frontend URL
2. **Frontend:** Set correct `VITE_API_URL` in environment variables
3. **Deployment:** No additional configuration needed

## Future Enhancements:

- [ ] CSV export format
- [ ] Scheduled automatic backups
- [ ] Cloud storage integration (Google Drive, Dropbox)
- [ ] Selective export (date range, categories)
- [ ] Import history tracking
- [ ] Data merge options (keep duplicates vs skip)

## Troubleshooting:

### Common Issues:

1. **"Failed to export data"**
   - Check if user is logged in
   - Verify backend is running
   - Check network tab for errors

2. **"Invalid JSON file format"**
   - Ensure file is valid JSON
   - File must have `version` and `transactions` fields

3. **"Unsupported data version"**
   - Export file was created with incompatible version
   - Re-export using current system

## Support:

For issues or questions, please check:
- Backend logs for error messages
- Browser console for frontend errors
- Network tab for API request/response details
