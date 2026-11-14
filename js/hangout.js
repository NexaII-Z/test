// One-click Hangout Plaza template (the same script is in docs/HangoutPlaza.lua)
window.PLAZA_HANGOUT=String.raw`local L = game:GetService("Lighting")
local SSS = game:GetService("ServerScriptService")
local function V(x, y, z) return Vector3.new(x, y, z) end
local function C(r, g, b) return Color3.fromRGB(r, g, b) end

local kill = {}
for _, c in ipairs(children(workspace)) do
  if c.Name == "Baseplate" or c.Name == "HangoutPlaza" or c.ClassName == "SpawnLocation" then kill[#kill + 1] = c end
end
for _, c in ipairs(kill) do c:Destroy() end
local oldAnim = SSS:FindFirstChild("HangoutAnimation")
if oldAnim then oldAnim:Destroy() end

local R = Instance.new("Model")
R.Name = "HangoutPlaza"
R.Parent = workspace

local STONE = C(206, 200, 190)
local STONE2 = C(178, 172, 164)
local DARK = C(52, 54, 62)
local WOOD = C(139, 96, 62)
local GRASS = C(96, 166, 84)
local HEDGE = C(52, 118, 62)
local WATER = C(72, 170, 225)
local PINK = C(255, 110, 170)
local CYAN = C(80, 220, 255)
local VIOLET = C(170, 120, 255)
local GOLD = C(255, 220, 90)
local WARM = C(255, 214, 150)
local BRICK = C(176, 112, 92)
local PAL = { PINK, CYAN, VIOLET, GOLD }

local count = 0
local function part(name, x, y, z, sx, sy, sz, col, mat, par, solid, shape, rot)
  local p = Instance.new("Part")
  p.Name = name
  p.Anchored = true
  p.Size = V(sx, sy, sz)
  p.Position = V(x, y, z)
  p.Color = col
  p.Material = mat or "Plastic"
  if solid == false then p.CanCollide = false end
  if shape then p.Shape = shape end
  if rot then p.Orientation = rot end
  p.Parent = par or R
  count = count + 1
  return p
end
local function cyl(name, x, y, z, h, d, col, mat, par, solid)
  return part(name, x, y, z, h, d, d, col, mat, par, solid, "Cylinder", V(0, 0, 90))
end
local function ball(name, x, y, z, d, col, mat, par, solid)
  return part(name, x, y, z, d, d, d, col, mat, par, solid, "Ball")
end
local function glow(p, col, range, bright)
  local l = Instance.new("PointLight")
  l.Color = col
  l.Range = range
  l.Brightness = bright
  l.Parent = p
end
local function group(n)
  local g = Instance.new("Model")
  g.Name = n
  g.Parent = R
  return g
end

local Gg = group("Grounds")
local Gf = group("Fountain")
local Gb = group("Benches")
local Gt = group("Trees")
local Gl = group("Lamps")
local Gd = group("DanceFloor")
local Gs = group("Stage")
local Gn = group("Lounge")
local Gc = group("Campfire")
local Gp = group("Pond")
local Gk = group("Cafe")
local Ge = group("Gate")

part("Ground", 0, -1, 0, 320, 2, 320, GRASS, "Grass", Gg)
part("HedgeN", 0, 5, -157, 320, 10, 6, HEDGE, "Grass", Gg)
part("HedgeS", 0, 5, 157, 320, 10, 6, HEDGE, "Grass", Gg)
part("HedgeW", -157, 5, 0, 6, 10, 320, HEDGE, "Grass", Gg)
part("HedgeE", 157, 5, 0, 6, 10, 320, HEDGE, "Grass", Gg)
for i = 0, 7 do
  local a = math.rad(i * 45)
  local col = (i % 2 == 0) and C(80, 150, 100) or C(70, 130, 110)
  ball("Hill" .. i, math.cos(a) * 250, -35, math.sin(a) * 250, 150, col, "Grass", Gg, false)
end

cyl("PlazaRim", 0, 0.3, 0, 0.6, 96, STONE2, "Concrete", Gg)
cyl("PlazaMid", 0, 0.4, 0, 0.8, 80, STONE, "Concrete", Gg)
cyl("PlazaInner", 0, 0.5, 0, 1.0, 64, STONE2, "Concrete", Gg)
cyl("PlazaStar", 0, 0.55, 0, 1.1, 44, C(232, 224, 208), "Concrete", Gg)
local pathCol = C(168, 140, 112)
part("PathE", 96, 0.2, 0, 100, 0.4, 14, pathCol, "Brick", Gg)
part("PathW", -96, 0.2, 0, 100, 0.4, 14, pathCol, "Brick", Gg)
part("PathN", 0, 0.2, -96, 14, 0.4, 100, pathCol, "Brick", Gg)
part("PathS", 0, 0.2, 96, 14, 0.4, 100, pathCol, "Brick", Gg)

cyl("FountainBase", 0, 1.9, 0, 1.6, 28, STONE2, "Concrete", Gf)
cyl("FountainBasin", 0, 3.2, 0, 1.4, 24, STONE, "Concrete", Gf)
local w1 = cyl("FountainWater", 0, 3.95, 0, 0.3, 21, WATER, "Glass", Gf, false)
w1.Transparency = 0.3
w1.Reflectance = 0.2
cyl("FountainPillar", 0, 7.5, 0, 7, 4, STONE2, "Concrete", Gf)
cyl("FountainBowl", 0, 11, 0, 1, 12, STONE, "Concrete", Gf)
local w2 = cyl("FountainWater2", 0, 11.65, 0, 0.3, 10, WATER, "Glass", Gf, false)
w2.Transparency = 0.3
local orb = ball("FountainOrb", 0, 13.8, 0, 3.2, CYAN, "Neon", Gf, false)
glow(orb, CYAN, 45, 1.5)

local function bench(x, z, alongX, s)
  local fy = 0.8
  if alongX then
    part("BenchSeat", x, fy + 1.55, z, 7, 0.5, 2.4, WOOD, "Wood", Gb)
    part("BenchBack", x, fy + 2.95, z + s * 1.0, 7, 2.2, 0.5, WOOD, "Wood", Gb)
    part("BenchLegL", x - 2.6, fy + 0.65, z, 0.7, 1.3, 2, DARK, "Metal", Gb)
    part("BenchLegR", x + 2.6, fy + 0.65, z, 0.7, 1.3, 2, DARK, "Metal", Gb)
  else
    part("BenchSeat", x, fy + 1.55, z, 2.4, 0.5, 7, WOOD, "Wood", Gb)
    part("BenchBack", x + s * 1.0, fy + 2.95, z, 0.5, 2.2, 7, WOOD, "Wood", Gb)
    part("BenchLegL", x, fy + 0.65, z - 2.6, 2, 1.3, 0.7, DARK, "Metal", Gb)
    part("BenchLegR", x, fy + 0.65, z + 2.6, 2, 1.3, 0.7, DARK, "Metal", Gb)
  end
end
bench(35, -14, false, 1)
bench(35, 14, false, 1)
bench(-35, -14, false, -1)
bench(-35, 14, false, -1)
bench(-14, 35, true, 1)
bench(14, 35, true, 1)
bench(-14, -35, true, -1)
bench(14, -35, true, -1)

local function tree(x, z, s, blossom)
  cyl("Trunk", x, 3 * s, z, 6 * s, 1.8 * s, WOOD, "Wood", Gt)
  local c1 = blossom and C(255, 170, 200) or C(72, 150, 72)
  local c2 = blossom and C(255, 195, 215) or C(88, 168, 80)
  ball("Leaves", x, 7.5 * s, z, 11 * s, c1, "Grass", Gt, false)
  ball("Leaves2", x + 1.5 * s, 10 * s, z - 1 * s, 8 * s, c2, "Grass", Gt, false)
end
local T = {
  {42, 42}, {-42, 42}, {42, -42}, {-42, -42}, {62, 22}, {-62, 22}, {62, -22}, {-62, -22},
  {24, 70}, {-24, 70}, {24, -66}, {-24, -66}, {125, 95}, {-125, 95}, {125, -100}, {-125, -100},
  {128, 24}, {-128, -24}, {128, -24}, {60, 125}, {-60, 125}, {45, 95}, {-45, 95}, {60, -120},
  {-60, -120}, {110, -125}, {-110, -125}, {-128, 24}
}
for i, t in ipairs(T) do tree(t[1], t[2], 0.9 + (i % 3) * 0.15, i % 3 == 0) end

local function lamp(x, z)
  cyl("Pole", x, 5, z, 10, 0.8, DARK, "Metal", Gl)
  ball("LampHead", x, 10.6, z, 2.6, WARM, "Neon", Gl, false)
end
for _, d in ipairs({62, 92, 122}) do
  lamp(d, 9)
  lamp(-d, -9)
  lamp(-9, d)
  if d == 62 then lamp(9, -d) end
end

cyl("GatePillarL", -11, 8, 132, 16, 3.4, STONE2, "Concrete", Ge)
cyl("GatePillarR", 11, 8, 132, 16, 3.4, STONE2, "Concrete", Ge)
part("GateBeam", 0, 16.5, 132, 28, 2.2, 3, DARK, "Metal", Ge)
part("GateNeon", 0, 16.5, 130.4, 24, 1, 0.4, PINK, "Neon", Ge, false)
ball("GateOrbL", -11, 17.9, 132, 2.6, CYAN, "Neon", Ge, false)
ball("GateOrbR", 11, 17.9, 132, 2.6, CYAN, "Neon", Ge, false)
local sp = Instance.new("SpawnLocation")
sp.Name = "Spawn"
sp.Anchored = true
sp.Size = V(12, 0.6, 12)
sp.Position = V(0, 0.7, 118)
sp.Color = C(70, 72, 84)
sp.Material = "Slate"
sp.Parent = R
for _, px in ipairs({-24, 24}) do
  part("Planter", px, 1, 124, 10, 2, 4, STONE2, "Concrete", Ge)
  for i = -2, 2 do
    ball("Flower", px + i * 1.8, 2.7, 124, 1.4, PAL[(i + 3) % 4 + 1], "Plastic", Ge, false)
  end
end

part("DanceBase", 0, 0.15, -90, 44, 0.3, 20, DARK, "Slate", Gd)
local n = 0
for ix = -3, 3 do
  for iz = 0, 2 do
    n = n + 1
    part("Tile" .. n, ix * 6, 0.4, -96 + iz * 6, 5.6, 0.2, 5.6, PAL[(ix + iz + 8) % 4 + 1], "Neon", Gd, false)
  end
end

part("StageFloor", 0, 1, -118, 52, 2, 24, DARK, "Slate", Gs)
part("StepA", 0, 0.335, -103, 14, 0.67, 2, DARK, "Slate", Gs)
part("StepB", 0, 0.665, -105, 14, 1.33, 2, DARK, "Slate", Gs)
part("StageBack", 0, 10, -129, 52, 16, 2, C(30, 30, 40), "Slate", Gs)
part("Screen1", -13, 10.5, -127.8, 12, 10, 0.3, PINK, "Neon", Gs, false)
part("Screen2", 0, 10.5, -127.8, 12, 10, 0.3, CYAN, "Neon", Gs, false)
part("Screen3", 13, 10.5, -127.8, 12, 10, 0.3, VIOLET, "Neon", Gs, false)
part("TrussTop", 0, 19.5, -118, 52, 1.2, 1.2, C(150, 154, 165), "Metal", Gs)
cyl("TrussL", -25, 10.5, -118, 17, 1.4, C(150, 154, 165), "Metal", Gs)
cyl("TrussR", 25, 10.5, -118, 17, 1.4, C(150, 154, 165), "Metal", Gs)
for i = -2, 2 do
  ball("Spot" .. (i + 3), i * 10, 18.4, -118, 1.8, PAL[(i + 3) % 4 + 1], "Neon", Gs, false)
end
part("SpeakerL", -22, 6, -122, 5, 8, 4, DARK, "Slate", Gs)
part("SpeakerR", 22, 6, -122, 5, 8, 4, DARK, "Slate", Gs)
part("DJTable", 0, 3.2, -124, 12, 2.4, 4, C(60, 62, 72), "Metal", Gs)
part("DJGlow", 0, 4.5, -122, 12, 0.3, 0.3, CYAN, "Neon", Gs, false)
local sl = ball("StageLight", 0, 17, -112, 1.4, PINK, "Neon", Gs, false)
glow(sl, PINK, 60, 1.4)

part("LoungeFloor", 85, 0.5, -55, 38, 1, 30, C(120, 86, 64), "Wood", Gn)
for _, dx in ipairs({-16, 16}) do
  for _, dz in ipairs({-12, 12}) do
    cyl("Pillar", 85 + dx, 6.5, -55 + dz, 11, 1.6, C(245, 240, 232), "Concrete", Gn)
  end
end
part("LoungeRoof", 85, 12.3, -55, 42, 1.2, 34, C(196, 96, 84), "Brick", Gn)
part("TrimFront", 85, 11.6, -38, 42, 0.4, 0.4, WARM, "Neon", Gn, false)
part("TrimBack", 85, 11.6, -72, 42, 0.4, 0.4, WARM, "Neon", Gn, false)
part("TrimL", 64, 11.6, -55, 0.4, 0.4, 34, WARM, "Neon", Gn, false)
part("TrimR", 106, 11.6, -55, 0.4, 0.4, 34, WARM, "Neon", Gn, false)
part("Rug", 85, 1.05, -55, 16, 0.1, 12, C(70, 90, 160), "Plastic", Gn, false)
local function couch(x, z, s)
  local g = Gn
  local tc = C(60, 130, 140)
  part("CouchSeat", x, 1.8, z, 9, 1.6, 3.6, tc, "Plastic", g)
  part("CouchBack", x, 3.0, z + s * 1.3, 9, 2.4, 1, tc, "Plastic", g)
  part("CouchArmL", x - 4.2, 2.1, z, 1, 2.2, 3.6, tc, "Plastic", g)
  part("CouchArmR", x + 4.2, 2.1, z, 1, 2.2, 3.6, tc, "Plastic", g)
end
couch(85, -63, -1)
couch(85, -47, 1)
part("CoffeeTable", 85, 1.9, -55, 5, 0.4, 3, WOOD, "Wood", Gn)
part("CoffeeLeg", 85, 1.4, -55, 1.2, 0.9, 1.2, DARK, "Metal", Gn)
for i = 0, 8 do
  ball("String" .. i, 65 + i * 5, 11.0, -38, 1.0, PAL[i % 4 + 1], "Neon", Gn, false)
end
local ll = ball("LoungeLamp", 85, 10.5, -55, 1.8, WARM, "Neon", Gn, false)
glow(ll, WARM, 35, 1)

cyl("FirePit", 85, 0.6, 55, 1.2, 7, C(90, 88, 92), "Slate", Gc)
cyl("FireAsh", 85, 1.25, 55, 0.2, 5, C(30, 30, 32), "Slate", Gc)
local fs = ball("FireSpot", 85, 2.2, 55, 1.8, C(255, 140, 40), "Neon", Gc, false)
local fire = Instance.new("Fire")
fire.Parent = fs
glow(fs, C(255, 150, 60), 40, 1.6)
for _, dx in ipairs({-9, 9}) do
  part("LogZ", 85 + dx, 0.9, 55, 7, 1.8, 1.8, WOOD, "Wood", Gc, true, "Cylinder", V(0, 90, 0))
end
for _, dz in ipairs({-9, 9}) do
  part("LogX", 85, 0.9, 55 + dz, 7, 1.8, 1.8, WOOD, "Wood", Gc, true, "Cylinder")
end

part("RimN", -85, 0.5, 34, 44, 1, 2, STONE2, "Concrete", Gp)
part("RimS", -85, 0.5, 76, 44, 1, 2, STONE2, "Concrete", Gp)
part("RimW", -107, 0.5, 55, 2, 1, 42, STONE2, "Concrete", Gp)
part("RimE", -63, 0.5, 55, 2, 1, 42, STONE2, "Concrete", Gp)
local pw = part("PondWater", -85, 0.35, 55, 40, 0.5, 40, WATER, "Glass", Gp, false)
pw.Transparency = 0.35
pw.Reflectance = 0.15
part("BridgeStepN", -85, 0.75, 38.5, 8, 1.5, 3, WOOD, "Wood", Gp)
part("BridgeStepS", -85, 0.75, 71.5, 8, 1.5, 3, WOOD, "Wood", Gp)
part("BridgeDeck", -85, 1.7, 55, 8, 0.8, 30, WOOD, "Wood", Gp)
part("RailL", -88.7, 3.2, 55, 0.4, 0.4, 30, WOOD, "Wood", Gp)
part("RailR", -81.3, 3.2, 55, 0.4, 0.4, 30, WOOD, "Wood", Gp)
for i = 0, 4 do
  part("PostL", -88.7, 2.7, 41 + i * 7, 0.5, 1.3, 0.5, WOOD, "Wood", Gp)
  part("PostR", -81.3, 2.7, 41 + i * 7, 0.5, 1.3, 0.5, WOOD, "Wood", Gp)
end

part("CafeFloor", -85, 0.5, -55, 34, 1, 26, C(196, 170, 140), "Wood", Gk)
part("CafeBack", -85, 7, -68, 34, 12, 1, BRICK, "Brick", Gk)
local gl1 = part("CafeGlassL", -102, 7, -55, 1, 12, 26, C(190, 225, 240), "Glass", Gk)
gl1.Transparency = 0.5
local gl2 = part("CafeGlassR", -68, 7, -55, 1, 12, 26, C(190, 225, 240), "Glass", Gk)
gl2.Transparency = 0.5
part("CafeFrontL", -96.5, 7, -42, 11, 12, 1, BRICK, "Brick", Gk)
part("CafeFrontR", -73.5, 7, -42, 11, 12, 1, BRICK, "Brick", Gk)
part("CafeSign", -85, 11.8, -42, 12, 2.2, 0.8, PINK, "Neon", Gk, false)
part("CafeRoof", -85, 13.6, -55, 38, 1.2, 30, C(70, 60, 70), "Slate", Gk)
part("Counter", -85, 2.6, -63, 20, 3.2, 3.2, WOOD, "Wood", Gk)
part("CounterTop", -85, 4.3, -63, 21, 0.4, 4, DARK, "Slate", Gk)
for i = 0, 4 do
  cyl("Stool", -93 + i * 4, 2.4, -59, 2.8, 1.6, C(200, 70, 80), "Plastic", Gk)
end
for _, tx in ipairs({-97, -73}) do
  cyl("TableLeg", tx, 2.2, -50, 2.4, 0.8, DARK, "Metal", Gk)
  cyl("TableTop", tx, 3.55, -50, 0.3, 5, C(240, 230, 214), "Wood", Gk)
  cyl("ChairA", tx - 3.4, 1.9, -50, 1.8, 1.6, C(200, 70, 80), "Plastic", Gk)
  cyl("ChairB", tx + 3.4, 1.9, -50, 1.8, 1.6, C(200, 70, 80), "Plastic", Gk)
end
for _, px in ipairs({-101, -69}) do
  cyl("Pot", px, 1.8, -45, 1.6, 2, C(150, 90, 60), "Plastic", Gk)
  ball("Plant", px, 3.9, -45, 3.4, C(60, 150, 70), "Grass", Gk, false)
end
local cl = ball("CafeLamp", -85, 11, -55, 1.6, WARM, "Neon", Gk, false)
glow(cl, WARM, 40, 1.2)

L.ClockTime = 17.3
L.Brightness = 1.1
L.Ambient = C(125, 115, 135)
L.FogColor = C(255, 200, 165)
L.FogStart = 160
L.FogEnd = 750
local sky = L:FindFirstChild("Sky")
if not sky then
  sky = Instance.new("Sky")
  sky.Parent = L
end
sky.Color = C(250, 190, 150)

local src = [==[
local R = workspace:FindFirstChild("HangoutPlaza")
if R then
  local pal = {Color3.fromRGB(255,110,170), Color3.fromRGB(80,220,255), Color3.fromRGB(170,120,255), Color3.fromRGB(255,220,90)}
  local tiles = children(R.DanceFloor)
  local st = R.Stage
  local screens = {st.Screen1, st.Screen2, st.Screen3}
  local orb = R.Fountain.FountainOrb
  local t = 0
  while true do
    t = t + 1
    for i, p in ipairs(tiles) do p.Color = pal[(i + t) % 4 + 1] end
    for i, s in ipairs(screens) do s.Color = pal[(i * 2 + t) % 4 + 1] end
    orb.Color = pal[(t // 2) % 4 + 1]
    wait(0.6)
  end
end
]==]
local anim = Instance.new("Script")
anim.Name = "HangoutAnimation"
anim.Source = src
anim.Parent = SSS

print("Hangout Plaza built: " .. count .. " parts. Press Play and invite friends!")
`;
document.getElementById('hgo').onclick=()=>{loadRoot(tmpl('base'));menu(false);window.__src=window.PLAZA_HANGOUT;try{execF()}catch(x){out('Error: '+x)}};
