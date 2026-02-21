from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from .models import StockOutTransaction

@receiver(post_save, sender=StockOutTransaction)
def deduct_item_quantity(sender, instance, created, **kwargs):
    if created:
        with transaction.atomic():
            item = instance.item
            # Ensure we don't drop below zero
            if item.quantity >= instance.quantity_deducted:
                item.quantity -= instance.quantity_deducted
                item.save()
            else:
                # Depending on your preference, you can raise an exception here 
                # which would be caught by the DRF serializer during validation.
                raise ValueError("Insufficient stock for this transaction.")