# Generated by Django 4.2.2 on 2023-06-16 16:39

import django.db.models.deletion
from django.db import migrations, models

from lineage.models import Source


def create_sources(apps, schema_editor):
    # We can't import the Person model directly as it may be a newer
    # version than this migration expects. We use the historical version.
    Connection = apps.get_model("connections", "Connection")

    for connection in Connection.objects.all():
        source, created = Source.objects.get_or_create(
            workspace_id=connection.workspace_id,
            name=connection.connector.slug,
        )

        connection.source_id = source.id
        connection.save()


def add_source_to_run(apps, schema_editor):
    # We can't import the Person model directly as it may be a newer
    # version than this migration expects. We use the historical version.
    from connections.models import Run

    for run in Run.objects.all():
        run.source_id = run.connection.source_id
        run.save()


class Migration(migrations.Migration):
    dependencies = [
        ("lineage", "0010_remove_edge_data_source_remove_node_data_source_and_more"),
        ("connections", "0022_alter_connector_slug"),
    ]

    operations = [
        migrations.AddField(
            model_name="connection",
            name="source",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="connections",
                to="lineage.source",
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="run",
            name="source",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="runs",
                to="lineage.source",
            ),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="run",
            name="connection",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="runs",
                to="connections.connection",
            ),
        ),
        migrations.RunPython(create_sources),
        migrations.RunPython(add_source_to_run),
    ]
