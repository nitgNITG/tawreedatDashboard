# Section-Based Translation Management System

## 🚀 Overview
An improved translation management system that loads translations by sections for better performance and organization.

## ✨ New Features

### Section-Based Loading
- Only loads specific sections (e.g., "common", "nav", "login") instead of entire translation files
- Faster loading times and better performance
- Organized by logical sections

### Server-Side Rendering
- Initial data fetching happens on the server for better performance
- Automatic key discovery on page load

### Three-Tier API System
1. **Keys API**: `GET /api/translations?keys=true` - Returns available sections
2. **Section API**: `GET /api/translations?section=common` - Returns specific section
3. **Full API**: `GET /api/translations` - Returns all translations (legacy)

## 🎯 How to Use

### 1. Access the System
Navigate to: `/admin/translations`

### 2. Select a Section
- View available sections (common, nav, login, etc.)
- Click on any section to manage its translations
- See statistics about your translation coverage

### 3. Manage Translations
- **Search**: Find specific translations within the section
- **Edit**: Modify existing translations inline
- **Add**: Create new translation keys for the section
- **Delete**: Remove unwanted translations
- **Save**: Persist changes to files
- **Export**: Download section as JSON

## 🔧 API Endpoints

### Get Available Keys
```http
GET /api/translations?keys=true
```
Response:
```json
{
  "keys": ["common", "nav", "login", "products", "orders"]
}
```

### Get Section Data
```http
GET /api/translations?section=common
```
Response:
```json
{
  "section": "common",
  "en": {
    "email": "Email",
    "phone": "Phone",
    "save": "Save"
  },
  "ar": {
    "email": "البريد الإلكتروني",
    "phone": "الهاتف",
    "save": "حفظ"
  }
}
```

### Update Section
```http
PUT /api/translations
```
Body:
```json
{
  "section": "common",
  "en": { "email": "Email", "phone": "Phone" },
  "ar": { "email": "البريد الإلكتروني", "phone": "الهاتف" }
}
```

## 🏗️ File Structure
```
app/
├── [locale]/
│   └── admin/
│       └── translations/
│           ├── page.tsx                    # Main server component
│           ├── TranslationKeysSelector.tsx  # Section selector
│           ├── TranslationSectionManager.tsx # Section editor
│           └── test/
│               └── page.tsx                # API testing page
├── api/
│   └── translations/
│       └── route.ts                       # Enhanced API routes
```

## 🧪 Testing

### Test the APIs
1. Go to `/admin/translations/test`
2. Test the Keys API to see available sections
3. Test specific sections by clicking on the section badges
4. Verify the legacy full API still works

### Example Sections in Your Project
Based on your current translations, you should see sections like:
- `common` - Shared translations
- `nav` - Navigation items
- `login` - Authentication related
- `orders` - Order management
- `navbar` - Top navigation
- `products` - Product related
- And many more...

## 🎨 Benefits

### Performance
- ⚡ Faster loading (only load what you need)
- 📱 Better mobile experience
- 🔄 Reduced server load

### Developer Experience
- 🎯 Focused editing per section
- 🔍 Better search within sections
- 📋 Clear organization
- 💾 Section-specific exports

### Scalability
- 📈 Works well with large translation files
- 🔧 Easy to maintain
- 🌍 Supports multiple languages
- 🔒 Maintains backward compatibility

## 🚨 Important Notes

1. **Automatic Backups**: System creates backups before saving any changes
2. **Server Restart**: After significant changes, restart your dev server
3. **File Permissions**: Ensure write access to `i18n/lang/` directory
4. **Nested Keys**: Support for nested structures (e.g., `error.validation.email`)

## 🔄 Migration from Old System
The new system is backward compatible. Your existing translations will work unchanged, and you can gradually migrate to section-based editing.
