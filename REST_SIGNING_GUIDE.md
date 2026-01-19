# Rest Apps - APK Signing Setup Guide

ഈ പ്രോജക്റ്റിന് ഒരു പുതിയ പേരും ഐഡന്റിറ്റിയും ഉള്ളതുകൊണ്ട്, നമുക്ക് പുതിയൊരു **Signing Key** ആവശ്യമാണ്. ഞാൻ അത് നിങ്ങളുടെ പ്രോജക്റ്റിൽ ഇപ്പോൾ തന്നെ നിർമ്മിച്ചിട്ടുണ്ട്.

GitHub വഴി ഓട്ടോമാറ്റിക്കായി APK നിർമ്മിക്കുന്നതിന് (GitHub Actions), താഴെ പറയുന്ന **4 Secrets** നിങ്ങൾ GitHub വെബ്‌സൈറ്റിൽ ആഡ് ചെയ്യേണ്ടതുണ്ട്.

### **ചെയ്യേണ്ട ഘട്ടങ്ങൾ:**
1. നിങ്ങളുടെ GitHub Repository തുറക്കുക.
2. **Settings** -> **Secrets and variables** -> **Actions** എന്നതിൽ പോകുക.
3. **New repository secret** എന്ന ബട്ടൺ അമർത്തുക.
4. താഴെ പറയുന്ന ഓരോ പേരും അവയുടെ വാല്യൂവും (Value) നൽകി സേവ് ചെയ്യുക.

| Secret Name | Value |
| :--- | :--- |
| **`KEYSTORE_BASE64`** | *(താഴെ നൽകിയിരിക്കുന്ന നീളമുള്ള സ്ട്രിംഗ് കോപ്പി ചെയ്ത് പേസ്റ്റ് ചെയ്യുക)* |
| **`KEYSTORE_PASSWORD`** | `restapps123` |
| **`KEY_ALIAS`** | `restkey` |
| **`KEY_PASSWORD`** | `restapps123` |

---

### **KEYSTORE_BASE64 Value (ഇത് മുഴുവനായി കോപ്പി ചെയ്യുക):**
```text
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
```

ഇത് പേസ്റ്റ് ചെയ്തു കഴിഞ്ഞാൽ, നിങ്ങൾ കോഡ് പുഷ് ചെയ്യുമ്പോൾ GitHub തനിയെ APK നിർമ്മിക്കാൻ തുടങ്ങും.
