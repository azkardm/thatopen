import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.util.shape

ifc_file = ifcopenshell.open("public\sample.ifc")


# slabs = ifc_file.by_type("IfcSlab")
slab = ifc_file.by_id(1225)

settings = ifcopenshell.geom.settings()
shape = ifcopenshell.geom.create_shape(settings, slab)

area = round(ifcopenshell.util.shape.get_area(shape.geometry),2)
print(f'Facade area: {area} m2')

volume = round(ifcopenshell.util.shape.get_volume(shape.geometry),2)
print(f'Facade volume: {volume} m2')

x = ifcopenshell.util.shape.get_x(shape.geometry)
y = ifcopenshell.util.shape.get_y(shape.geometry)
z = ifcopenshell.util.shape.get_z(shape.geometry)
print(f'Facade position: x = {x}, y = {y}, z = {z}')

height = ifcopenshell.util.shape.get_top_elevation(shape.geometry)
# height_mm = height * 1000
print(f'Height: {height} m')

perimeter = round(ifcopenshell.util.shape.get_footprint_perimeter(shape.geometry),2)
print(f'Facade perimeter: {perimeter} m')

f_area = round(ifcopenshell.util.shape.get_footprint_area(shape.geometry),2)
print(f'Facade footprint area: {f_area} m')