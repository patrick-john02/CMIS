# your_app/admin.py (or a dedicated admin_site.py imported on startup)
from django.contrib import admin
from app.models import *

admin.site.site_header = "CSU Massage Inventory Super Admin"
admin.site.site_title = "CSU Massage Inventory Super Admin"
admin.site.index_title = "Dashboard"

admin.site.register(Item)
admin.site.register(StockOutTransaction)
