import os

with open('database_schema.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

new_rls = """ALTER TABLE public.taller_servicios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a taller_servicios" ON public.taller_servicios FOR ALL USING (true) WITH CHECK (true);
"""

if 'taller_servicios' not in sql:
    sql += "\n-- 6. Políticas adicionales\n" + new_rls
    with open('database_schema.sql', 'w', encoding='utf-8') as f:
        f.write(sql)
    print("added to schema")
else:
    print("already in schema")
