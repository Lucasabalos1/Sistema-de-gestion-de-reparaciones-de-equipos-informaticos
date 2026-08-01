import csv
import io


def procesar_csv_inventario(archivo):
    lector = csv.DictReader(io.TextIOWrapper(archivo, encoding='utf-8-sig'))
    vistos = set()
    resultado = []

    for fila in lector:
        nombre = (fila.get('nombre') or '').strip()
        stock = (fila.get('stock') or '').strip()
        precio = (fila.get('precio_unidad') or '').strip()

        if not nombre or not stock or not precio:
            continue

        nombre_key = nombre.lower()
        if nombre_key in vistos:
            continue
        vistos.add(nombre_key)

        try:
            stock_int = int(stock)
            precio_int = int(precio)
        except ValueError:
            continue

        if stock_int < 0 or precio_int <= 0:
            continue

        resultado.append({
            'nombre': nombre,
            'stock': stock_int,
            'precio_unidad': precio_int
        })

    return resultado
