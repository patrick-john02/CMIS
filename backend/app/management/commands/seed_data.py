from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from app.models import Item, StockOutTransaction
import random

class Command(BaseCommand):
    help = 'Seeds the database with initial CSU-MIMS inventory data and users'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting database seeding...'))

        # 1. Create Users
        admin_user, admin_created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@csu-mims.local',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if admin_created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('Created Admin User (admin / admin123)')

        staff_user, staff_created = User.objects.get_or_create(
            username='inventory_staff',
            defaults={
                'email': 'staff@csu-mims.local',
                'is_staff': True
            }
        )
        if staff_created:
            staff_user.set_password('staff123')
            staff_user.save()
            self.stdout.write('Created Staff User (inventory_staff / staff123)')

        # 2. Define Seed Data for Items
        items_data = [
            # Training Center Items
            {'name': 'Virgin Coconut Oil', 'description': '1 Gallon container for basic massage training', 'quantity': 15, 'unit': 'gallons', 'allocation_type': 'TRAINING'},
            {'name': 'White Bath Towels', 'description': 'Standard large towels for draping', 'quantity': 50, 'unit': 'pieces', 'allocation_type': 'TRAINING'},
            {'name': 'Massage Beds', 'description': 'Portable folding massage tables', 'quantity': 10, 'unit': 'units', 'allocation_type': 'TRAINING'},
            {'name': 'Eucalyptus Essential Oil', 'description': '100ml bottles for aromatherapy', 'quantity': 20, 'unit': 'bottles', 'allocation_type': 'TRAINING'},
            
            # NC II Assessment Items
            {'name': 'Premium Assessment Lotion', 'description': 'Hypoallergenic lotion specifically for NC II exams', 'quantity': 30, 'unit': 'bottles', 'allocation_type': 'NC2'},
            {'name': 'Assessment Linens Set', 'description': 'Complete bed setup (fitted sheet, flat sheet, face cradle cover)', 'quantity': 15, 'unit': 'sets', 'allocation_type': 'NC2'},
            {'name': '70% Isopropyl Alcohol', 'description': '500ml bottles for sanitizing stations during assessment', 'quantity': 40, 'unit': 'bottles', 'allocation_type': 'NC2'},
            {'name': 'Massage Timers', 'description': 'Digital clocks for monitoring assessment duration', 'quantity': 12, 'unit': 'pieces', 'allocation_type': 'NC2'},
        ]

        # 3. Insert Items into Database
        created_items = []
        for data in items_data:
            item, created = Item.objects.get_or_create(
                name=data['name'],
                allocation_type=data['allocation_type'],
                defaults={
                    'description': data['description'],
                    'quantity': data['quantity'],
                    'unit': data['unit']
                }
            )
            created_items.append(item)
            if created:
                self.stdout.write(f"Added Item: {item.name} ({item.get_allocation_type_display()})")

        # 4. Create Sample Stock-Out Transactions
        # We only generate transactions if none exist to prevent duplicate deductions on multiple seed runs
        if not StockOutTransaction.objects.exists():
            self.stdout.write('Generating sample stock-out history...')
            
            for _ in range(5):
                # Pick a random item that has stock
                item = random.choice([i for i in created_items if i.quantity > 5])
                deduct_amount = random.randint(1, 3)
                
                # Note: Because we have a post_save signal on StockOutTransaction,
                # creating this record will automatically deduct from the Item's quantity!
                StockOutTransaction.objects.create(
                    item=item,
                    quantity_deducted=deduct_amount,
                    remarks=random.choice([
                        'Issued to Batch 4 Trainees', 
                        'Used for mock assessment', 
                        'Requested by Instructor Jane',
                        'Station setup for NC2 Examinees'
                    ]),
                    released_by=staff_user
                )
            self.stdout.write('Sample transactions created successfully.')

        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))