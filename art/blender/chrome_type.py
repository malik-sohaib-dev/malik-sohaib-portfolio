# Words in molten chrome, for the film's "liquid chrome type" direction: the letters extruded and
# bevelled, drips hanging from their undersides into puddles on the floor, all fused into one
# surface, on a mirror-black studio floor or in a white cove.
#   blender -b --factory-startup -P art/blender/chrome_type.py -- <text> <out.png> <w> <h> <black|white> <melt 0..1> [font.ttf]
import math
import random
import sys

import bpy

argv = sys.argv[sys.argv.index('--') + 1 :]
text, out, W, H, room, melt = argv[0], argv[1], int(argv[2]), int(argv[3]), argv[4], float(argv[5])
font_path = argv[6] if len(argv) > 6 else 'art/out/directions/display-900.ttf'
rng = random.Random(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# The word, standing up, facing the camera, its baseline a little above the floor.
curve = bpy.data.curves.new('word', 'FONT')
curve.body = text
curve.font = bpy.data.fonts.load(font_path)
curve.align_x = 'CENTER'
curve.extrude = 0.09
curve.bevel_depth = 0.018
curve.bevel_resolution = 4
word = bpy.data.objects.new('word', curve)
scene.collection.objects.link(word)
word.rotation_euler = (math.radians(90), 0, 0)
lift = 0.25 + 0.25 * melt
word.location = (0, 0, lift)
bpy.context.view_layer.objects.active = word
word.select_set(True)
bpy.ops.object.convert(target='MESH')
xs = [v.co.x for v in word.data.vertices]
zs = [(word.matrix_world @ v.co).z for v in word.data.vertices]
x0, x1, top = min(xs), max(xs), max(zs)
width = x1 - x0

# Drips from the undersides of the letters down to puddles on the floor.
if melt > 0:
    meta = bpy.data.metaballs.new('melt')
    meta.resolution = 0.016
    meta.render_resolution = 0.012
    drips = bpy.data.objects.new('melt', meta)
    scene.collection.objects.link(drips)
    bottoms = sorted({round(v.co.x, 2) for v in word.data.vertices if (word.matrix_world @ v.co).z < lift + 0.03})
    for _ in range(int(6 + 14 * melt)):
        if not bottoms:
            break
        x = rng.choice(bottoms)
        length = lift * rng.uniform(0.35, 1.0) * (0.6 + 0.4 * melt)
        e = meta.elements.new(type='CAPSULE')
        e.co = (x, 0, lift - length / 2 + 0.04)
        e.size_x = length / 2
        e.radius = rng.uniform(0.03, 0.055)
        e.rotation = (0.7071, 0, 0.7071, 0)  # stand the capsule upright
        tip = meta.elements.new(type='BALL')
        tip.co = (x, 0, lift - length + 0.02)
        tip.radius = e.radius * 1.5
        if length > lift * 0.8:
            pool = meta.elements.new(type='ELLIPSOID')
            pool.co = (x, 0, 0.0)
            pool.size_x, pool.size_y, pool.size_z = rng.uniform(0.08, 0.2), rng.uniform(0.05, 0.12), 0.012
            pool.radius = 0.06
    bpy.context.view_layer.objects.active = drips
    for o in scene.objects:
        o.select_set(o is drips)
    bpy.ops.object.convert(target='MESH')
    drips = bpy.context.view_layer.objects.active
    # One surface: join, remesh, and relax the seams.
    for o in scene.objects:
        o.select_set(o in (word, drips))
    bpy.context.view_layer.objects.active = word
    bpy.ops.object.join()
    rm = word.modifiers.new('one', 'REMESH')
    rm.mode = 'VOXEL'
    rm.voxel_size = 0.006
    sm = word.modifiers.new('relax', 'CORRECTIVE_SMOOTH')
    sm.iterations = 6
    sm.smooth_type = 'LENGTH_WEIGHTED'
bpy.ops.object.shade_smooth()

chrome = bpy.data.materials.new('chrome')
chrome.use_nodes = True
b = chrome.node_tree.nodes['Principled BSDF']
b.inputs['Base Color'].default_value = (0.92, 0.92, 0.92, 1)
b.inputs['Metallic'].default_value = 1.0
b.inputs['Roughness'].default_value = 0.05
word.data.materials.append(chrome)

# The room.
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, 0))
floor = bpy.context.active_object
fm = bpy.data.materials.new('floor')
fm.use_nodes = True
fb = fm.node_tree.nodes['Principled BSDF']
if room == 'white':
    fb.inputs['Base Color'].default_value = (0.5, 0.5, 0.49, 1)
    fb.inputs['Roughness'].default_value = 0.4
    # The cove: the floor curves up into the wall behind.
    bpy.ops.mesh.primitive_cylinder_add(radius=3, depth=60, location=(0, 4, 3), rotation=(0, math.radians(90), 0))
    cove = bpy.context.active_object
    cove.data.materials.append(fm)
else:
    fb.inputs['Base Color'].default_value = (0.004, 0.004, 0.004, 1)
    fb.inputs['Roughness'].default_value = 0.12
    fb.inputs['Specular IOR Level'].default_value = 0.35
floor.data.materials.append(fm)

w = bpy.data.worlds.new('w')
scene.world = w
w.use_nodes = True
nt = w.node_tree
tc = nt.nodes.new('ShaderNodeTexCoord')
wave = nt.nodes.new('ShaderNodeTexWave')
wave.bands_direction = 'Z'
wave.inputs['Scale'].default_value = 0.6
ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].position = 0.35
ramp.color_ramp.elements[0].color = (0.004, 0.004, 0.004, 1)
ramp.color_ramp.elements[1].position = 0.8
ramp.color_ramp.elements[1].color = (2.2, 2.2, 2.2, 1) if room == 'black' else (3.0, 3.0, 3.0, 1)
nt.links.new(tc.outputs['Generated'], wave.inputs['Vector'])
nt.links.new(wave.outputs['Fac'], ramp.inputs['Fac'])
nt.links.new(ramp.outputs['Color'], nt.nodes['Background'].inputs['Color'])
nt.nodes['Background'].inputs['Strength'].default_value = 0.25 if room == 'black' else 0.55

for loc, energy, size in (((-2.5, -3, 3.5), 900, 3), ((3, -2, 2.5), 500, 2), ((0, 2.5, 4), 700, 4)):
    light = bpy.data.lights.new('l', 'AREA')
    light.energy = energy * (0.7 if room == 'white' else 1)
    light.size = size
    lo = bpy.data.objects.new('l', light)
    lo.location = loc
    lo.rotation_euler = (math.atan2(math.hypot(loc[0], loc[1]), loc[2]) * 0 + math.radians(50), 0, math.atan2(loc[0], -loc[1]))
    scene.collection.objects.link(lo)

# The camera frames the word with room around it, a little above, looking slightly down.
cam = bpy.data.cameras.new('c')
cam.lens = 50
co = bpy.data.objects.new('c', cam)
scene.collection.objects.link(co)
scene.camera = co
aspect = W / H
half = math.atan(18 / cam.lens)  # half the field of view on the fitted side (36 mm sensor)
if aspect >= 1:
    cam.sensor_fit = 'HORIZONTAL'
    tan_h, tan_v = math.tan(half), math.tan(half) / aspect
else:
    cam.sensor_fit = 'VERTICAL'
    tan_v, tan_h = math.tan(half), math.tan(half) * aspect
dist = max(width * 0.6 / tan_h, top * (0.64 if aspect >= 1 else 0.85) / tan_v)
elev = math.radians(7)
cz = top * 0.5
co.location = (0, -dist * math.cos(elev), cz + dist * math.sin(elev))
co.rotation_euler = (math.radians(90) - elev, 0, 0)

# Something bright in front of the letters for their faces to reflect: a tall soft card behind
# the camera, brighter at the top, so the chrome reads as chrome and not as black glass.
bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -dist * 1.6, top * 1.2), rotation=(math.radians(90), 0, 0))
card = bpy.context.active_object
card.scale = (width * 3, top * 4, 1)
cm = bpy.data.materials.new('card')
cm.use_nodes = True
cn = cm.node_tree.nodes
em = cn.new('ShaderNodeEmission')
grad = cn.new('ShaderNodeTexGradient')
tco = cn.new('ShaderNodeTexCoord')
cr = cn.new('ShaderNodeValToRGB')
cr.color_ramp.elements[0].color = (0.02, 0.02, 0.02, 1)
cr.color_ramp.elements[1].position = 0.75
cr.color_ramp.elements[1].color = (1, 1, 1, 1)
mapping = cn.new('ShaderNodeMapping')
mapping.inputs['Rotation'].default_value = (0, 0, math.radians(90))
cm.node_tree.links.new(tco.outputs['Generated'], mapping.inputs['Vector'])
cm.node_tree.links.new(mapping.outputs['Vector'], grad.inputs['Vector'])
cm.node_tree.links.new(grad.outputs['Fac'], cr.inputs['Fac'])
cm.node_tree.links.new(cr.outputs['Color'], em.inputs['Color'])
em.inputs["Strength"].default_value = 4.0
out_node = cn['Material Output']
cm.node_tree.links.new(em.outputs['Emission'], out_node.inputs['Surface'])
card.data.materials.append(cm)
card.visible_camera = False

scene.render.engine = 'CYCLES'
scene.cycles.samples = 96
scene.cycles.use_denoising = True
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    scene.cycles.device = 'GPU'
except Exception as e:
    print('GPU unavailable:', e)
scene.render.resolution_x = W
scene.render.resolution_y = H
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - High Contrast'
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print('rendered', text, out)
