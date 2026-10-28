# Liquid-chrome hero objects for the project posters, rendered on a transparent background.
#   blender -b --factory-startup -P art/blender/chrome.py -- <kind> <arg> <out.png> [width height]
# kinds:
#   text  <string>   melted chrome lettering in Big Shoulders 900 (art/fonts)
#   bean  -          a chrome Mini Havoc bean with two glossy eyes
#   merge <count>    a row of droplets that run together into one drop
import math
import os
import sys

import bpy

argv = sys.argv[sys.argv.index('--') + 1:]
kind, arg, out = argv[0], argv[1], argv[2]
rx, ry = (int(argv[3]), int(argv[4])) if len(argv) > 4 else (1200, 1500)
FONT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts', 'big-shoulders-900.ttf')

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def chrome(name='chrome', base=0.92, rough=0.06):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (base, base, base, 1)
    bsdf.inputs['Metallic'].default_value = 1.0
    bsdf.inputs['Roughness'].default_value = rough
    return mat


def melt(obj, voxel=0.008, strength=0.05, scale=0.35, smooth=12):
    """Voxel-remesh, push with soft noise, then relax: hard letters become poured metal."""
    rem = obj.modifiers.new('remesh', 'REMESH')
    rem.mode = 'VOXEL'
    rem.voxel_size = voxel
    rem.use_smooth_shade = True
    tex = bpy.data.textures.new('melt', 'CLOUDS')
    tex.noise_scale = scale
    tex.noise_depth = 2
    disp = obj.modifiers.new('melt', 'DISPLACE')
    disp.texture = tex
    disp.strength = strength
    sm = obj.modifiers.new('smooth', 'SMOOTH')
    sm.iterations = smooth
    sm.factor = 0.8


def link(obj):
    scene.collection.objects.link(obj)
    return obj


if kind == 'text':
    curve = bpy.data.curves.new('t', 'FONT')
    curve.body = arg
    curve.font = bpy.data.fonts.load(FONT)
    curve.extrude = 0.18
    curve.bevel_depth = 0.05
    curve.bevel_resolution = 4
    curve.align_x = 'CENTER'
    curve.align_y = 'CENTER'
    curve.space_character = 1.12
    obj = link(bpy.data.objects.new('t', curve))
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.rotation_euler = (math.radians(90), 0, 0)
    melt(obj, voxel=0.006, strength=0.035, scale=0.45)
    obj.data.materials.append(chrome())
    subjects = [obj]

elif kind == 'bean':
    # An egg body and two stubby feet, fused by a voxel remesh so it reads as one poured piece.
    parts = []
    for loc, scl in [((0, 0, 0), (0.62, 0.56, 0.8)), ((-0.24, -0.02, -0.72), (0.2, 0.22, 0.16)), ((0.24, -0.02, -0.72), (0.2, 0.22, 0.16))]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=loc, segments=64, ring_count=32)
        o = bpy.context.active_object
        o.scale = scl
        parts.append(o)
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.join()
    bean = bpy.context.active_object
    melt(bean, voxel=0.01, strength=0.015, scale=0.6, smooth=20)
    bean.data.materials.append(chrome())
    eye_mat = bpy.data.materials.new('eye')
    eye_mat.use_nodes = True
    eb = eye_mat.node_tree.nodes['Principled BSDF']
    eb.inputs['Base Color'].default_value = (0.003, 0.003, 0.003, 1)
    eb.inputs['Roughness'].default_value = 0.3
    subjects = [bean]
    for x in (-0.19, 0.19):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=(x, -0.5, 0.22), segments=48, ring_count=24)
        eye = bpy.context.active_object
        eye.scale = (0.075, 0.06, 0.11)
        eye.data.materials.append(eye_mat)
        bpy.ops.object.shade_smooth()
    # A slight turn, so the bean looks back at you rather than straight ahead.
    bpy.ops.object.select_all(action='SELECT')

elif kind == 'merge':
    # Many small drops fall and run together into one big drop.
    n = int(arg)
    mb = bpy.data.metaballs.new('merge')
    mb.resolution = 0.02
    mb.render_resolution = 0.01
    mb.threshold = 0.6
    for i in range(n):
        t = i / (n - 1)
        rows = max(1, round(4 * (1 - t) ** 1.2))
        for r in range(rows):
            e = mb.elements.new(type='BALL')
            # Falling: the drops are above, the pool they run into is below.
            e.co = ((r - (rows - 1) / 2) * 0.42 * (1 - t) ** 0.7, 0, 1.4 - 2.5 * t ** 0.85)
            e.radius = 0.26 + 0.7 * t ** 2.4
    blob = link(bpy.data.objects.new('merge', mb))
    blob.data.materials.append(chrome())
    subjects = [blob]

elif kind == 'torus':
    # A ring of mercury, slightly poured, to stand in for a letter O.
    bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=0.42, major_segments=96, minor_segments=48)
    ring = bpy.context.active_object
    ring.rotation_euler = (math.radians(90), 0, math.radians(18))
    melt(ring, voxel=0.012, strength=0.05, scale=0.5, smooth=16)
    ring.data.materials.append(chrome())
    subjects = [ring]

elif kind == 'ico':
    # A geodesic model, either as an engineer's wireframe or poured in chrome (arg: wire | chrome).
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1.25)
    ico = bpy.context.active_object
    ico.rotation_euler = (math.radians(20), math.radians(10), math.radians(30))
    if arg == 'wire':
        w = ico.modifiers.new('wire', 'WIREFRAME')
        w.thickness = 0.018
        m = bpy.data.materials.new('wire')
        m.use_nodes = True
        nt = m.node_tree
        nt.nodes.remove(nt.nodes['Principled BSDF'])
        em = nt.nodes.new('ShaderNodeEmission')
        em.inputs['Strength'].default_value = 3.0
        nt.links.new(em.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface'])
        ico.data.materials.append(m)
    else:
        sub = ico.modifiers.new('sub', 'SUBSURF')
        sub.levels = sub.render_levels = 3
        melt(ico, voxel=0.014, strength=0.12, scale=0.6, smooth=10)
        ico.data.materials.append(chrome())
    subjects = [ico]

else:
    raise SystemExit(f'unknown kind {kind}')

# The studio: soft light and dark bands for the chrome to reflect. They are what make it read as liquid.
world = bpy.data.worlds.new('w')
scene.world = world
world.use_nodes = True
nt = world.node_tree
coord = nt.nodes.new('ShaderNodeTexCoord')
wave = nt.nodes.new('ShaderNodeTexWave')
wave.bands_direction = 'Z'
wave.inputs['Scale'].default_value = 0.9
wave.inputs['Distortion'].default_value = 0.6
wave.inputs['Detail'].default_value = 0.0
ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].position = 0.3
ramp.color_ramp.elements[0].color = (0.01, 0.01, 0.01, 1)
ramp.color_ramp.elements[1].position = 0.85
ramp.color_ramp.elements[1].color = (1.4, 1.4, 1.4, 1)
nt.links.new(coord.outputs['Generated'], wave.inputs['Vector'])
nt.links.new(wave.outputs['Fac'], ramp.inputs['Fac'])
nt.links.new(ramp.outputs['Color'], nt.nodes['Background'].inputs['Color'])

for loc, energy, size in [((-3, -4, 4), 900, 3), ((4, -3, -1), 400, 2), ((0, 3, 5), 300, 4)]:
    light = bpy.data.lights.new('l', 'AREA')
    light.energy = energy
    light.size = size
    lo = link(bpy.data.objects.new('l', light))
    lo.location = loc
    lo.rotation_euler = (math.radians(60), 0, math.atan2(loc[0], -loc[1]))

# Frame the subjects: fit their world-space bounds into the picture with a margin.
bpy.context.view_layer.update()
deps = bpy.context.evaluated_depsgraph_get()
xs, zs, ys = [], [], []
for s in subjects:
    ev = s.evaluated_get(deps)
    for c in ev.bound_box:
        w = ev.matrix_world @ __import__('mathutils').Vector(c)
        xs.append(w.x)
        ys.append(w.y)
        zs.append(w.z)
cx, cz = (min(xs) + max(xs)) / 2, (min(zs) + max(zs)) / 2
width, height = max(xs) - min(xs), max(zs) - min(zs)
if kind == 'ico':
    # Both versions of the geodesic share one fixed frame, so they line up when layered.
    cx, cz, width, height = 0.0, 0.0, 2.7, 2.7
cam = bpy.data.cameras.new('c')
cam.lens = 85
cam.sensor_width = cam.sensor_height = 36
cam.sensor_fit = 'VERTICAL' if ry > rx else 'HORIZONTAL'
co = link(bpy.data.objects.new('c', cam))
scene.camera = co
fit = max(width * ry / rx, height) if ry > rx else max(width, height * rx / ry)
dist = fit * 1.3 * cam.lens / 36 - min(ys)
co.location = (cx, -dist, cz)
co.rotation_euler = (math.radians(90), 0, 0)

scene.render.engine = 'CYCLES'
scene.cycles.samples = 128
scene.cycles.use_denoising = True
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    scene.cycles.device = 'GPU'
except Exception as e:  # CPU still works, just slower
    print('GPU unavailable, using CPU:', e)
scene.render.resolution_x = rx
scene.render.resolution_y = ry
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - High Contrast'
scene.render.filepath = out
bpy.ops.render.render(write_still=True)
print('rendered', out)
