# The logo's turntable: the chrome ring turning in 3D, as transparent frames for a CSS sprite.
#   blender -b --factory-startup -P art/blender/ring.py -- <out_prefix> [size frames]
import math
import sys

import bpy

argv = sys.argv[sys.argv.index('--') + 1:]
out = argv[0]
size = int(argv[1]) if len(argv) > 1 else 64
frames = int(argv[2]) if len(argv) > 2 else 48

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=0.42, major_segments=96, minor_segments=48)
ring = bpy.context.active_object
bpy.ops.object.shade_smooth()
m = bpy.data.materials.new('chrome')
m.use_nodes = True
b = m.node_tree.nodes['Principled BSDF']
b.inputs['Base Color'].default_value = (0.9, 0.9, 0.9, 1)
b.inputs['Metallic'].default_value = 1.0
b.inputs['Roughness'].default_value = 0.06
ring.data.materials.append(m)

# A studio of a few broad light and dark bands for the chrome to reflect.
w = bpy.data.worlds.new('w')
scene.world = w
w.use_nodes = True
nt = w.node_tree
tc = nt.nodes.new('ShaderNodeTexCoord')
wave = nt.nodes.new('ShaderNodeTexWave')
wave.bands_direction = 'Z'
wave.inputs['Scale'].default_value = 0.32
wave.inputs['Distortion'].default_value = 0.0
ramp = nt.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].position = 0.3
ramp.color_ramp.elements[0].color = (0.01, 0.01, 0.01, 1)
ramp.color_ramp.elements[1].position = 0.85
ramp.color_ramp.elements[1].color = (1.5, 1.5, 1.5, 1)
nt.links.new(tc.outputs['Generated'], wave.inputs['Vector'])
nt.links.new(wave.outputs['Fac'], ramp.inputs['Fac'])
nt.links.new(ramp.outputs['Color'], nt.nodes['Background'].inputs['Color'])

cam = bpy.data.cameras.new('c')
cam.type = 'ORTHO'
cam.ortho_scale = 3.05
co = bpy.data.objects.new('c', cam)
scene.collection.objects.link(co)
scene.camera = co
co.location = (0, -6, 0)
co.rotation_euler = (math.radians(90), 0, 0)


# One wobble per loop: the ring's axis circles 40 degrees around the view, like a coin settling,
# so it always shows its hole (never a flat dash at 26px) while the highlights sweep round it.
def frame(sc, _=None):
    a = 2 * math.pi * (sc.frame_current - 1) / frames
    tilt = math.radians(40)
    ring.rotation_euler = (math.radians(90) + tilt * math.sin(a), 0, tilt * math.cos(a))


bpy.app.handlers.frame_change_pre.append(frame)
scene.frame_start = 1
scene.frame_end = frames
scene.render.engine = 'CYCLES'
scene.cycles.samples = 32
scene.cycles.use_denoising = True
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    scene.cycles.device = 'GPU'
except Exception as e:
    print('GPU unavailable, using CPU:', e)
scene.render.resolution_x = size
scene.render.resolution_y = size
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - High Contrast'
scene.render.filepath = out + '_'
bpy.ops.render.render(animation=True)
print('rendered', frames, 'frames')
