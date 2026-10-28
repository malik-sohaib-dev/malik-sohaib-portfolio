# Grayscale poster scenes: liquid-chrome subjects on a glossy studio floor, lit as one picture.
#   blender -b --factory-startup -P art/blender/poster.py -- <scene> <out.png> [width height [frames]]
# With frames, it renders a seamless loop to <out>_0001.png onwards: the camera drifts and some
# scenes move (beans hop, drops fall, dots type).
# scenes: ezvenda, mini-havoc, gympaid, photon, vibe, pvsmith, hero
import math
import os
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
scene_name, out = argv[0], argv[1]
rx, ry = (int(argv[2]), int(argv[3])) if len(argv) > 3 else (1200, 1500)
FRAMES = int(argv[4]) if len(argv) > 4 else 0
ANIM = []  # functions of t in [0, 1): what moves in the loop
CAM = {}
FONT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts', 'big-shoulders-900.ttf')

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
col = scene.collection


# Materials ---------------------------------------------------------------------------------------
def mat_chrome(rough=0.05):
    m = bpy.data.materials.new('chrome')
    b = m.node_tree.nodes['Principled BSDF'] if m.use_nodes else None
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (0.9, 0.9, 0.9, 1)
    b.inputs['Metallic'].default_value = 1.0
    b.inputs['Roughness'].default_value = rough
    return m


def mat_plain(grey, rough, name='plain'):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (grey, grey, grey, 1)
    b.inputs['Roughness'].default_value = rough
    return m


CHROME = mat_chrome()
EYE = mat_plain(0.004, 0.25, 'eye')


# Builders ----------------------------------------------------------------------------------------
def melt(obj, voxel=0.008, strength=0.04, scale=0.4, smooth=12):
    rem = obj.modifiers.new('remesh', 'REMESH')
    rem.mode = 'VOXEL'
    rem.voxel_size = voxel
    rem.use_smooth_shade = True
    tex = bpy.data.textures.new('melt', 'CLOUDS')
    tex.noise_scale = scale
    tex.noise_depth = 2
    d = obj.modifiers.new('melt', 'DISPLACE')
    d.texture = tex
    d.strength = strength
    s = obj.modifiers.new('smooth', 'SMOOTH')
    s.iterations = smooth
    s.factor = 0.8


def text(body, size=1.0, loc=(0, 0, 0), rot_z=0.0, extrude=0.18, line=0.86):
    c = bpy.data.curves.new('t', 'FONT')
    c.body = body
    c.font = bpy.data.fonts.load(FONT)
    c.size = size
    c.extrude = extrude * size
    c.bevel_depth = 0.05 * size
    c.bevel_resolution = 4
    c.align_x = 'CENTER'
    c.space_character = 1.1
    c.space_line = line
    o = bpy.data.objects.new('t', c)
    col.objects.link(o)
    bpy.context.view_layer.objects.active = o
    for x in bpy.context.selected_objects:
        x.select_set(False)
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    o.rotation_euler = (math.radians(90), 0, rot_z)
    o.location = loc
    melt(o, voxel=0.006 * size, strength=0.03 * size, scale=0.45 * size)
    o.data.materials.append(CHROME)
    return o


def ground(obj, lift=0.0):
    """Stand an object on the floor: move it so its lowest evaluated point sits at z = lift."""
    bpy.context.view_layer.update()
    ev = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    low = min((ev.matrix_world @ Vector(c)).z for c in ev.bound_box)
    obj.location.z += lift - low
    return obj


def sphere(loc, scale, mat=CHROME, segs=64):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=loc, segments=segs, ring_count=segs // 2)
    o = bpy.context.active_object
    o.scale = scale
    o.data.materials.append(mat)
    bpy.ops.object.shade_smooth()
    return o


def bean(loc=(0, 0, 0), s=1.0, turn=0.0, tilt=0.0):
    """A Mini Havoc bean: egg body and two feet fused into one poured piece, two glossy eyes."""
    parts = []
    for p, sc in [((0, 0, 0.8), (0.62, 0.56, 0.8)), ((-0.24, -0.02, 0.08), (0.2, 0.22, 0.16)), ((0.24, -0.02, 0.08), (0.2, 0.22, 0.16))]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1, location=p, segments=64, ring_count=32)
        o = bpy.context.active_object
        o.scale = sc
        parts.append(o)
    for x in bpy.context.selected_objects:
        x.select_set(False)
    for o in parts:
        o.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.join()
    body = bpy.context.active_object
    melt(body, voxel=0.01, strength=0.012, scale=0.6, smooth=20)
    body.data.materials.append(CHROME)
    eyes = [sphere((x, -0.5, 1.02), (0.075, 0.06, 0.11), EYE, 48) for x in (-0.19, 0.19)]
    # Parent everything to an empty so the bean moves as one.
    root = bpy.data.objects.new('bean', None)
    col.objects.link(root)
    for o in [body, *eyes]:
        o.parent = root
    root.location = loc
    root.scale = (s, s, s)
    root.rotation_euler = (tilt, 0, turn)
    return root


def drops(n, x0, top, bottom, pool_r):
    """Drops falling into a pool: metaballs that run together as they reach the floor."""
    mb = bpy.data.metaballs.new('drops')
    mb.resolution = 0.03
    mb.render_resolution = 0.012
    mb.threshold = 0.6
    for i in range(n):
        t = i / (n - 1)
        e = mb.elements.new(type='BALL')
        e.co = (x0 + math.sin(i * 2.3) * 0.05 * (1 - t), 0, top - (top - bottom) * t ** 0.9)
        e.radius = 0.16 + 0.12 * t
    pool = mb.elements.new(type='ELLIPSOID')
    pool.co = (x0, 0, bottom - 0.05)
    pool.radius = pool_r
    pool.size_x, pool.size_y, pool.size_z = 1.0, 1.0, 0.18
    o = bpy.data.objects.new('drops', mb)
    col.objects.link(o)
    o.data.materials.append(CHROME)
    return o


# The studio ----------------------------------------------------------------------------------------
def studio(floor_grey=0.004, wall_top=0.0, wall_horizon=0.03, light=False):
    # A glossy floor that fades into the backdrop, so there is no visible horizon line.
    bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 8, 0))
    floor = bpy.context.active_object
    fm = bpy.data.materials.new('floor')
    fm.use_nodes = True
    nt = fm.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (floor_grey, floor_grey, floor_grey, 1)
    b.inputs['Roughness'].default_value = 0.14
    b.inputs['Specular IOR Level'].default_value = 0.6
    floor.data.materials.append(fm)

    # Backdrop: the world is a vertical gradient, dark overhead and lighter at the horizon.
    w = bpy.data.worlds.new('w')
    scene.world = w
    w.use_nodes = True
    n = w.node_tree
    tc = n.nodes.new('ShaderNodeTexCoord')
    sep = n.nodes.new('ShaderNodeSeparateXYZ')
    ramp = n.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (wall_horizon, wall_horizon, wall_horizon, 1)
    ramp.color_ramp.elements[1].position = 0.6
    ramp.color_ramp.elements[1].color = (wall_top, wall_top, wall_top, 1)
    # Soft bright bands for the chrome to reflect.
    wave = n.nodes.new('ShaderNodeTexWave')
    wave.bands_direction = 'Z'
    wave.inputs['Scale'].default_value = 0.9
    wave.inputs['Distortion'].default_value = 0.6
    band = n.nodes.new('ShaderNodeValToRGB')
    band.color_ramp.elements[0].position = 0.55
    band.color_ramp.elements[0].color = (0, 0, 0, 1)
    band.color_ramp.elements[1].position = 0.9
    band.color_ramp.elements[1].color = (1.6, 1.6, 1.6, 1)
    if light:
        # On a pale sweep the chrome needs dark things to reflect: bands of near-black.
        band.color_ramp.elements[0].color = (1, 1, 1, 1)
        band.color_ramp.elements[1].color = (0.02, 0.02, 0.02, 1)
    add = n.nodes.new('ShaderNodeMixRGB')
    add.blend_type = 'MULTIPLY' if light else 'ADD'
    add.inputs['Fac'].default_value = 1.0
    n.links.new(tc.outputs['Generated'], sep.inputs['Vector'])
    n.links.new(sep.outputs['Z'], ramp.inputs['Fac'])
    n.links.new(tc.outputs['Generated'], wave.inputs['Vector'])
    n.links.new(wave.outputs['Fac'], band.inputs['Fac'])
    # Bands only in the upper sky: the chrome catches them, the floor (grazing) reflects black.
    sky = n.nodes.new('ShaderNodeMapRange')
    sky.inputs['From Min'].default_value = 0.15
    sky.inputs['From Max'].default_value = 0.45
    n.links.new(sep.outputs['Z'], sky.inputs['Value'])
    gate = n.nodes.new('ShaderNodeMixRGB')
    gate.blend_type = 'MULTIPLY'
    gate.inputs['Fac'].default_value = 1.0
    n.links.new(band.outputs['Color'], gate.inputs['Color1'])
    n.links.new(sky.outputs['Result'], gate.inputs['Color2'])
    if light:
        # Light mode multiplies, so outside the sky the bands must be white, not black.
        gate.blend_type = 'MIX'
        gate.inputs['Color1'].default_value = (1, 1, 1, 1)
        n.links.new(sky.outputs['Result'], gate.inputs['Fac'])
        n.links.new(band.outputs['Color'], gate.inputs['Color2'])
    n.links.new(ramp.outputs['Color'], add.inputs['Color1'])
    n.links.new(gate.outputs['Color'], add.inputs['Color2'])
    # The camera sees only the dark backdrop; reflections see the bright bands too.
    lp = n.nodes.new('ShaderNodeLightPath')
    mix = n.nodes.new('ShaderNodeMixRGB')
    n.links.new(lp.outputs['Is Camera Ray'], mix.inputs['Fac'])
    n.links.new(add.outputs['Color'], mix.inputs['Color1'])
    n.links.new(ramp.outputs['Color'], mix.inputs['Color2'])
    n.links.new(mix.outputs['Color'], n.nodes['Background'].inputs['Color'])

    # A big softbox overhead and two strip lights for rims.
    # A key from above and in front, and two strip lights behind for rim highlights.
    for loc, rot, energy, size in [((-1.5, -2.5, 6), (math.radians(25), math.radians(-12), 0), 900, 3), ((-4, 3, 2), (0, math.radians(-70), 0), 700, 1.2), ((4, 3, 2.5), (0, math.radians(70), 0), 700, 1.2)]:
        l = bpy.data.lights.new('l', 'AREA')
        l.energy = energy
        l.shape = 'RECTANGLE'
        l.size = size
        l.size_y = size * 3 if size < 2 else size
        lo = bpy.data.objects.new('l', l)
        lo.location = loc
        lo.rotation_euler = rot
        col.objects.link(lo)
        # The rim strips light the subject but stay out of the mirror floor's reflection.
        if size < 2:
            lo.visible_glossy = False


def camera(target=(0, 0, 1.0), dist=7.5, height=1.6, lens=60, yaw=0.0):
    """yaw swings the camera around the target (degrees; positive looks from the right)."""
    cam = bpy.data.cameras.new('c')
    cam.lens = lens
    cam.sensor_fit = 'VERTICAL'
    cam.sensor_height = 36
    co = bpy.data.objects.new('c', cam)
    col.objects.link(co)
    scene.camera = co
    a = math.radians(yaw)
    co.location = (target[0] + dist * math.sin(a), target[1] - dist * math.cos(a), height)
    CAM.update(obj=co, target=Vector(target), dist=dist, height=height, yaw=yaw)
    d = Vector(target) - co.location
    co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    cam.dof.use_dof = True
    cam.dof.focus_distance = d.length
    cam.dof.aperture_fstop = 4.0


# Scenes ------------------------------------------------------------------------------------------
LIGHT = scene_name.endswith('-light')
base = scene_name[:-6] if LIGHT else scene_name
if LIGHT:
    # A pale studio: a grey mirror floor and a bright sweep, for the gallery palette.
    studio(floor_grey=0.45, wall_top=0.62, wall_horizon=0.92, light=True)
else:
    studio()
scene_name = base
if scene_name in ('hero-wide', 'hero-tall'):
    # The name, poured in chrome. Wide: one line per word, side by side in frame; tall: stacked big.
    name = text('MALIK\nSOHAIB', 2.4, (0, 0.6, 1.0), line=0.82)
    ground(name)
    camera(target=(0, 0.6, 2.0), dist=12.5 if scene_name == 'hero-tall' else 7.9, height=1.7, lens=58)
elif scene_name == 'mercury':
    # A drop of mercury mid-splash: one heavy body with satellites pulling away on necks.
    mb = bpy.data.metaballs.new('mercury')
    mb.resolution = 0.03
    mb.render_resolution = 0.008
    mb.threshold = 0.6
    body = mb.elements.new(type='ELLIPSOID')
    body.co = (0, 0, 1.25)
    body.radius = 2.1
    body.size_x, body.size_y, body.size_z = 1.0, 0.9, 0.8
    for co, r in [((1.25, -0.1, 1.75), 0.42), ((1.75, 0.0, 2.15), 0.2), ((-1.2, 0.1, 0.95), 0.48), ((-1.75, 0.0, 0.7), 0.24),
                  ((0.35, -0.2, 2.15), 0.36), ((0.55, -0.1, 2.65), 0.16), ((-0.4, 0.0, 0.45), 0.5), ((2.25, 0.1, 2.5), 0.1)]:
        e = mb.elements.new(type='BALL')
        e.co = co
        e.radius = r * 1.9
    o = bpy.data.objects.new('mercury', mb)
    col.objects.link(o)
    o.data.materials.append(CHROME)
    o.rotation_euler = (0, math.radians(-8), math.radians(14))
    camera(target=(0, 0.2, 1.45), dist=8.2, height=1.5, lens=58)
elif scene_name == 'ez-bag':
    # A chrome shopping bag with rope handles, a coin beside it: commerce, literally.
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.3, 0.95))
    bag = bpy.context.active_object
    bag.scale = (1.25, 0.55, 1.6)
    bpy.ops.object.transform_apply(scale=True)
    b = bag.modifiers.new('bevel', 'BEVEL')
    b.width = 0.06
    b.segments = 8
    sol = bag.modifiers.new('sub', 'SUBSURF')
    sol.levels = sol.render_levels = 1
    bag.data.materials.append(CHROME)
    bpy.ops.object.shade_smooth()
    bag.rotation_euler = (0, 0, math.radians(22))
    for x in (-0.38, 0.38):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.3, minor_radius=0.045, location=(x, 0.3, 1.75), rotation=(math.radians(90), 0, 0), major_segments=64, minor_segments=24)
        h = bpy.context.active_object
        h.data.materials.append(CHROME)
        bpy.ops.object.shade_smooth()
    t = text('Rs', 0.55, (0, -0.0, 1.05), extrude=0.05)
    t.location.y = -0.02
    for i, (x, y, z, r) in enumerate([(1.35, -0.6, 0.05, 0.3), (1.7, -0.2, 0.05, 0.24)]):
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=r * 0.22, location=(x, y, z), vertices=96)
        c = bpy.context.active_object
        c.modifiers.new('b', 'BEVEL').width = r * 0.08
        c.data.materials.append(CHROME)
        bpy.ops.object.shade_smooth()
    camera(target=(0.25, 0.3, 1.0), dist=8.4, height=1.7, lens=60)
elif scene_name == 'ez-phone':
    # A chrome phone standing on the floor, showing the real shop screen in grayscale.
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.3, 1.32))
    ph = bpy.context.active_object
    ph.scale = (1.22, 0.12, 2.5)
    bpy.ops.object.transform_apply(scale=True)
    bv = ph.modifiers.new('bevel', 'BEVEL')
    bv.width = 0.16
    bv.segments = 12
    ph.data.materials.append(CHROME)
    bpy.ops.object.shade_smooth()
    ph.rotation_euler = (0, 0, math.radians(-14))
    # The screen: an emissive image, desaturated, just in front of the body.
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0))
    sc = bpy.context.active_object
    sc.scale = (1.06, 2.32, 1)
    bpy.ops.object.transform_apply(scale=True)
    # Same turn as the body, just in front of its face.
    yaw = math.radians(-14)
    sc.rotation_euler = (math.radians(90), 0, yaw)
    off = -0.066
    sc.location = (-off * math.sin(yaw), 0.3 + off * math.cos(yaw), 1.32)
    m = bpy.data.materials.new('screen')
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.remove(nt.nodes['Principled BSDF'])
    tex = nt.nodes.new('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out', 'ez-screen.png'))
    hs = nt.nodes.new('ShaderNodeHueSaturation')
    hs.inputs['Saturation'].default_value = 0.0
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Strength'].default_value = 1.1
    nt.links.new(tex.outputs['Color'], hs.inputs['Color'])
    nt.links.new(hs.outputs['Color'], em.inputs['Color'])
    nt.links.new(em.outputs['Emission'], nt.nodes['Material Output'].inputs['Surface'])
    sc.data.materials.append(m)
    ground(text('Rs', 0.9, (1.45, -0.7, 0.4), extrude=0.12))
    camera(target=(0.2, 0.2, 1.35), dist=8.6, height=1.6, lens=58)
elif scene_name == 'p-ezvenda':
    # A market stall: a scalloped awning on two posts over a counter of bags and boxes.
    def box(loc, scale, rot=0.0, bev=0.03):
        bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
        o = bpy.context.active_object
        o.scale = scale
        bpy.ops.object.transform_apply(scale=True)
        o.rotation_euler = (0, 0, rot)
        m = o.modifiers.new('b', 'BEVEL')
        m.width = bev
        m.segments = 6
        o.data.materials.append(CHROME)
        bpy.ops.object.shade_smooth()
        return o
    box((0, 0.6, 0.55), (2.6, 0.9, 1.1), bev=0.05)            # counter
    for x in (-1.25, 1.25):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=2.4, location=(x, 1.0, 1.7), vertices=32)
        bpy.context.active_object.data.materials.append(CHROME)
    # The awning: a tilted slab with a row of half-discs along its front edge.
    aw = box((0, 0.55, 2.85), (2.9, 1.3, 0.06), bev=0.02)
    aw.rotation_euler = (math.radians(-16), 0, 0)
    for i in range(7):
        x = -1.24 + i * 0.413
        bpy.ops.mesh.primitive_cylinder_add(radius=0.24, depth=0.06, location=(x, -0.08, 2.6), rotation=(math.radians(90), 0, 0), vertices=48)
        c = bpy.context.active_object
        c.data.materials.append(CHROME)
        bpy.ops.object.shade_smooth()
    # Goods on the counter: a bag, boxes, a jar.
    bag = box((-0.65, 0.5, 1.45), (0.55, 0.3, 0.7), rot=math.radians(18))
    for x in (-0.8, -0.5):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.12, minor_radius=0.02, location=(x, 0.5, 1.86), rotation=(math.radians(90), 0, math.radians(18)), major_segments=48, minor_segments=16)
        bpy.context.active_object.data.materials.append(CHROME)
    box((0.25, 0.55, 1.28), (0.5, 0.45, 0.36), rot=math.radians(-12))
    box((0.3, 0.55, 1.62), (0.36, 0.34, 0.3), rot=math.radians(9))
    sphere((0.95, 0.5, 1.33), (0.22, 0.22, 0.24))
    camera(target=(0, 0.5, 1.5), dist=8.4, height=1.7, lens=54, yaw=30)
elif scene_name == 'p-havoc':
    # Beans on a sumo ring; one is being shoved off the edge.
    bpy.ops.mesh.primitive_cylinder_add(radius=1.9, depth=0.32, location=(0, 0.8, 0.16), vertices=128)
    ring = bpy.context.active_object
    bv = ring.modifiers.new('b', 'BEVEL')
    bv.width = 0.06
    bv.segments = 8
    ring.data.materials.append(CHROME)
    bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_torus_add(major_radius=1.55, minor_radius=0.025, location=(0, 0.8, 0.33), major_segments=128, minor_segments=12)
    bpy.context.active_object.data.materials.append(mat_plain(0.02, 0.4, 'line'))
    hoppers = [bean((-0.55, 0.9, 0.32), 0.85, math.radians(-30)), bean((0.35, 0.55, 0.32), 0.7, math.radians(20))]
    edge = bean((1.75, 0.2, 0.55), 0.62, math.radians(40), math.radians(-38))  # going over the edge
    base = [h.location.z for h in hoppers]
    def hop(t):
        for k, h in enumerate(hoppers):
            h.location.z = base[k] + 0.22 * abs(math.sin(2 * math.pi * (t * 2 + k * 0.25)))
        edge.rotation_euler.y = math.radians(-38 - 6 * math.sin(2 * math.pi * t))
    ANIM.append(hop)
    camera(target=(0.2, 0.7, 0.8), dist=8.4, height=2.6, lens=54)
elif scene_name == 'p-gympaid':
    # A tear-off calendar standing on 31, a dumbbell leaning on it.
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.6, 1.05))
    cal = bpy.context.active_object
    cal.scale = (1.5, 0.5, 2.1)
    bpy.ops.object.transform_apply(scale=True)
    m = cal.modifiers.new('b', 'BEVEL')
    m.width = 0.08
    m.segments = 8
    cal.data.materials.append(CHROME)
    bpy.ops.object.shade_smooth()
    cal.rotation_euler = (0, 0, math.radians(-12))
    for x in (-0.4, 0.4):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.12, minor_radius=0.03, location=(x * math.cos(math.radians(-12)), 0.6 + x * math.sin(math.radians(-12)), 2.12), rotation=(math.radians(90), 0, math.radians(-12)), major_segments=48, minor_segments=16)
        bpy.context.active_object.data.materials.append(CHROME)
    t = text('31', 1.25, (0, 0, 1.0), extrude=0.06)
    t.rotation_euler = (math.radians(90), 0, math.radians(-12))
    t.location = (0.06, 0.6 - 0.27, 1.0)
    for x in (-0.55, 0.55):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=0.2, location=(1.2 + x * 0.9, -0.55 + x * 0.25, 0.3), vertices=96)
        d = bpy.context.active_object
        d.rotation_euler = (0, math.radians(90), math.radians(16))
        d.modifiers.new('b', 'BEVEL').width = 0.03
        d.data.materials.append(CHROME)
        bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_cylinder_add(radius=0.055, depth=1.4, location=(1.2, -0.55, 0.3), vertices=48)
    bar = bpy.context.active_object
    bar.rotation_euler = (0, math.radians(90), math.radians(16))
    bar.data.materials.append(CHROME)
    camera(target=(0.35, 0.3, 1.1), dist=8.6, height=1.7, lens=58)
elif scene_name == 'p-vibe':
    # Two speech bubbles: a question asked, an answer coming back.
    def bubble(loc, w, h, tail_left):
        # A speech bubble poured as mercury: a soft rounded body and a tail of drops.
        mb = bpy.data.metaballs.new('bubble')
        mb.resolution = 0.03
        mb.render_resolution = 0.01
        mb.threshold = 0.6
        body = mb.elements.new(type='ELLIPSOID')
        body.co = (0, 0, 0)
        body.radius = 2.0
        body.size_x, body.size_y, body.size_z = w * 0.5, 0.26, h * 0.5
        side = -1 if tail_left else 1
        for k, (dx, dz, r) in enumerate([(0.3, -0.62, 0.32), (0.4, -0.88, 0.2), (0.48, -1.06, 0.12)]):
            e = mb.elements.new(type='BALL')
            e.co = (side * w * dx, 0, h * dz)
            e.radius = r * 1.9
        o = bpy.data.objects.new('bubble', mb)
        col.objects.link(o)
        o.location = loc
        o.data.materials.append(CHROME)
        return o
    bubble((-0.55, 0.6, 2.35), 1.7, 1.05, True)
    bubble((0.75, 0.2, 0.95), 1.45, 0.85, False)
    q = text('?', 0.85, (-0.55, -0.02, 2.02), extrude=0.06)
    q.location.y = -0.02
    dots = [sphere((x, -0.38, 0.95), (0.12, 0.12, 0.12), EYE) for x in (0.42, 0.75, 1.08)]
    def typing(t):
        for k, d in enumerate(dots):
            v = 0.12 * (1 + 0.35 * max(0.0, math.sin(2 * math.pi * (t * 2 - k * 0.18))))
            d.scale = (v, v, v)
            d.location.z = 0.95 + 0.06 * max(0.0, math.sin(2 * math.pi * (t * 2 - k * 0.18)))
    ANIM.append(typing)
    camera(target=(0.05, 0.4, 1.6), dist=8.6, height=1.9, lens=56, yaw=-28)
elif scene_name == 'p-solar':
    # Solar glass: near-black and glossy, with a lighter grid of cells.
    CELLS = bpy.data.materials.new('cells')
    CELLS.use_nodes = True
    cn = CELLS.node_tree
    pb = cn.nodes['Principled BSDF']
    pb.inputs['Roughness'].default_value = 0.12
    br = cn.nodes.new('ShaderNodeTexBrick')
    br.offset = 0.0
    br.inputs['Color1'].default_value = (0.012, 0.012, 0.012, 1)
    br.inputs['Color2'].default_value = (0.02, 0.02, 0.02, 1)
    br.inputs['Mortar'].default_value = (0.55, 0.55, 0.55, 1)
    br.inputs['Scale'].default_value = 9.0
    br.inputs['Mortar Size'].default_value = 0.012
    br.inputs['Brick Width'].default_value = 0.5
    br.inputs['Row Height'].default_value = 0.5
    tc = cn.nodes.new('ShaderNodeTexCoord')
    cn.links.new(tc.outputs['Object'], br.inputs['Vector'])
    cn.links.new(br.outputs['Color'], pb.inputs['Base Color'])
    # Solar panels tilted toward a chrome sun.
    for r in range(3):
        for c in range(4):
            bpy.ops.mesh.primitive_cube_add(size=1, location=(-1.35 + c * 0.9, 0.2 + r * 0.95, 0.35 + r * 0.05))
            pnl = bpy.context.active_object
            pnl.scale = (0.8, 0.55, 0.035)
            bpy.ops.object.transform_apply(scale=True)
            pnl.rotation_euler = (math.radians(38), 0, 0)
            pnl.modifiers.new('b', 'BEVEL').width = 0.012
            pnl.data.materials.append(CELLS)
            bpy.ops.mesh.primitive_cylinder_add(radius=0.02, depth=0.36, location=(-1.35 + c * 0.9, 0.35 + r * 0.95, 0.18), vertices=16)
            bpy.context.active_object.data.materials.append(CHROME)
    sphere((1.9, 4.6, 3.0), (0.75, 0.75, 0.75))
    camera(target=(0, 1.1, 0.9), dist=8.0, height=2.0, lens=52, yaw=34)
elif scene_name == 'mini-havoc':
    bean((0, 0.2, 0), 1.0, math.radians(-10))
    bean((-1.25, 1.0, 0), 0.75, math.radians(18))
    jumper = bean((1.15, 0.6, 1.1), 0.8, math.radians(-30), math.radians(12))
    camera(target=(0, 0.5, 1.15), dist=8.2, height=1.4, lens=62)
elif scene_name == 'ezvenda':
    ground(text('Rs', 2.0, (0, 0.4, 1.0)))
    for i, (x, y, z, r) in enumerate([(-1.5, -0.6, 0.06, 0.32), (1.4, -0.9, 0.06, 0.28), (1.0, 0.9, 2.6, 0.24), (-0.9, 1.2, 3.0, 0.2), (0.3, -1.2, 0.06, 0.22)]):
        coin = bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=r * 0.22, location=(x, y, z), vertices=96)
        o = bpy.context.active_object
        o.rotation_euler = (math.radians(0 if z < 0.2 else 70 + i * 15), math.radians(i * 23), 0)
        bev = o.modifiers.new('b', 'BEVEL')
        bev.width = r * 0.08
        bev.segments = 6
        o.data.materials.append(CHROME)
        bpy.ops.object.shade_smooth()
    camera(target=(0, 0.3, 1.2), dist=8.5, height=1.5, lens=62)
elif scene_name == 'gympaid':
    ground(text('31', 2.2, (0, 0.5, 1.0)))
    # A dumbbell lying in front.
    for x in (-0.7, 0.7):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.32, depth=0.22, location=(x * 0.75 + 0.55, -1.9, 0.32), vertices=96)
        o = bpy.context.active_object
        o.rotation_euler = (0, math.radians(90), math.radians(-18))
        o.modifiers.new('b', 'BEVEL').width = 0.03
        o.data.materials.append(CHROME)
        bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_cylinder_add(radius=0.06, depth=1.5, location=(0.55, -1.9, 0.32), vertices=48)
    o = bpy.context.active_object
    o.rotation_euler = (0, math.radians(90), math.radians(-18))
    o.data.materials.append(CHROME)
    bpy.ops.object.shade_smooth()
    camera(target=(0, 0, 1.15), dist=8.6, height=1.6, lens=60)
elif scene_name == 'photon':
    # Many streams fall and bend inward into one pool: many connections, one channel.
    mb = bpy.data.metaballs.new('streams')
    mb.resolution = 0.03
    mb.render_resolution = 0.01
    mb.threshold = 0.6
    drops = []
    def place(e, k, x_top, u):
        e.co = (x_top * max(0.0, 1 - u) ** 1.6, 0.2 * math.sin(k), 3.6 - 3.3 * u - (k % 2) * 0.25 * (1 - u))
        e.radius = 0.13 + 0.1 * min(u, 1.0)
    for k, x_top in enumerate([-1.5, -0.75, 0.0, 0.75, 1.5]):
        for i in range(9):
            e = mb.elements.new(type='BALL')
            place(e, k, x_top, i / 8)
            drops.append((e, k, x_top, i))
    # Each drop slides one place along its stream per loop, so the stream keeps pouring.
    def pour(t):
        for e, k, x_top, i in drops:
            place(e, k, x_top, (i + t) / 8)
    ANIM.append(pour)
    pool = mb.elements.new(type='ELLIPSOID')
    pool.co = (0, 0, 0.12)
    pool.radius = 1.5
    pool.size_x, pool.size_y, pool.size_z = 1.0, 0.8, 0.12
    o = bpy.data.objects.new('streams', mb)
    col.objects.link(o)
    o.data.materials.append(CHROME)
    camera(target=(0, 0, 1.6), dist=9.4, height=1.4, lens=56)
elif scene_name == 'vibe':
    ground(text('?', 3.6, (0, 0.4, 1.3)))
    camera(target=(0, 0.4, 1.3), dist=8.6, height=1.5, lens=60)
elif scene_name == 'pvsmith':
    ground(text('kW', 2.0, (0, 0.6, 1.0)))
    sphere((1.3, 4.5, 3.6), (0.95, 0.95, 0.95))
    camera(target=(0, 0.6, 1.4), dist=9.2, height=1.5, lens=58)
else:
    raise SystemExit(f'unknown scene {scene_name}')

# Render: Cycles, grayscale through the compositor's saturation, a little grain.
scene.render.engine = 'CYCLES'
scene.cycles.samples = 160
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
scene.render.resolution_x = rx
scene.render.resolution_y = ry
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - High Contrast'
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'BW'
if FRAMES:
    # A seamless loop: the camera swings a few degrees and back, and the scene's own motion runs.
    def frame(sc, _=None):
        t = (sc.frame_current - 1) / FRAMES
        if CAM:
            a = math.radians(CAM['yaw'] + 4 * math.sin(2 * math.pi * t))
            tg = CAM['target']
            CAM['obj'].location = (tg.x + CAM['dist'] * math.sin(a), tg.y - CAM['dist'] * math.cos(a), CAM['height'] + 0.08 * math.sin(4 * math.pi * t))
            d = tg - CAM['obj'].location
            CAM['obj'].rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        for f in ANIM:
            f(t)
    bpy.app.handlers.frame_change_pre.append(frame)
    scene.frame_start = 1
    scene.frame_end = FRAMES
    scene.render.fps = 24
    scene.cycles.samples = 48
    scene.render.filepath = out + '_'
    bpy.ops.render.render(animation=True)
    print('rendered', FRAMES, 'frames to', out)
else:
    scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print('rendered', out)
