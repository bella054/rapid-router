# Generated by Django 4.2.16 on 2024-11-27 15:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0106_fields_to_snake_case"),
    ]

    operations = [
        migrations.RenameField(
            model_name="episode",
            old_name="worksheet_link",
            new_name="student_worksheet_link",
        ),
    ]
