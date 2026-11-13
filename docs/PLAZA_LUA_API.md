# Plaza Engine – Lua scripting reference (give this file to an AI when asking for scripts)

Plaza is a Roblox-like engine. Scripts are **Lua 5.3 (Fengari)** with a Roblox-style API. It is NOT full Roblox/Luau: write plain Lua 5.3.

## Rules for writing scripts
- No Luau syntax: no type annotations, no `continue`, no `+=` / `-=`, no `task.defer`, no string interpolation. Write `n = n + 1`.
- **Vector3 / Color3 / UDim2 have no operators.** Use fields: `v.X, v.Y, v.Z`; build with `Vector3.new(x,y,z)`. To add: `Vector3.new(a.X+b.X, a.Y+b.Y, a.Z+b.Z)`.
- There is no CFrame. Position and Orientation (degrees) are separate properties.
- Call methods with `:` (`part:Destroy()`), read/write properties with `.`.
- `GetChildren()` does not return a Lua table. Use `children(inst)` (global helper) instead.
- Events: `thing.Event:Connect(function(...) end)` — returns an object with `:Disconnect()`.
- Put a script in `ServerScriptService` (Script) or `StarterGui` (LocalScript). Both run on Play. Scripts with `Disabled = true` do not run.
- `script` is the running script instance. `script.Parent` is its parent. Child lookup by name: `workspace.Part1`, `inst:FindFirstChild("Name")`.
- Anything inside `wait()` loops must call `wait`; the scheduler runs each script as a coroutine.
- Everything prints to the Output panel with `print(...)`.

## Globals
`game`, `workspace`, `script`, `Instance`, `Vector3`, `Color3`, `UDim2`, `print`, `wait(sec)`, `task.wait(sec)`, `task.spawn(fn, ...)`, `spawn(fn)`, `require(ModuleScript)`, `children(inst)`, plus the standard Lua libs (`math`, `string`, `table`, `os`, `coroutine`).
- `Vector3.new(x,y,z)`; `Color3.new(r,g,b)` (0–1); `Color3.fromRGB(r,g,b)` (0–255); `UDim2.new(xScale,xOffset,yScale,yOffset)`; `UDim2.fromOffset(x,y)`.
- `Instance.new("ClassName", optionalParent)`. Nothing appears until `.Parent` is set to something inside Workspace (3D) or a ScreenGui (UI).

## Services: `game:GetService(name)` (or `game.Name`)
`Workspace`, `Lighting`, `ReplicatedStorage`, `ServerScriptService`, `StarterGui`, `RunService`, `Players`.
- `RunService.Heartbeat:Connect(function(dt) end)` runs every frame.
- `Players.LocalPlayer.Name` (the player's chosen display name; the physics body is a Part named **"Player"** in Workspace during Play: `workspace.Player`, drawn as a 6-part animated avatar). Multiplayer, chat and emotes are handled by the engine, not by Lua.

## UserInputService: `game:GetService("UserInputService")`
Read each frame during Play: `MoveX` (-1 left … 1 right), `MoveY` (-1 back … 1 forward) from WASD/arrows/joystick/gamepad, `Jump` (Space/jump button).
Settable: `ControlsEnabled` (false stops the walking character, use it for vehicles), `TouchControlsEnabled` (false hides the built-in mobile joystick), `CameraSubject` (a part the camera follows), `CameraYaw` / `CameraPitch` (degrees; yaw 0 looks toward -Z, a camera behind an object facing heading H degrees is H+180), `CameraDistance`, `FieldOfView`.
Buttons also have `.MouseButton1Down` / `.MouseButton1Up` (press and hold, multi-touch safe) besides `.MouseButton1Click`.
**Vehicles:** put a `VehicleSeat` inside a `Model` together with the car's other parts. On Play the engine drives it natively (no script needed): the seat is the invisible physics hitbox, every other part in that Model follows it rigidly, parts named `Wheel*` spin and parts named `WheelF*` also steer. Seat properties: `MaxSpeed, Torque (acceleration), BoostSpeed, BoostTorque, TurnSpeed, AutoDrive, CameraDistance, CameraPitch`. UserInputService extras for UI: set `ExtraThrottle` (-1..1), `ExtraSteer` (-1..1, right = +1), `ExtraBrake` (bool), `Boost` (bool), `Respawn = true`; read `Speed` (km/h number), `SpeedFraction` (0..1), `Gear` ("D"/"N"/"R"). Example: `examples/Driving-Demo.plaza` (File → Open).

## Instance members (all objects)
Properties: `Name`, `ClassName`, `Parent`, plus class properties below.
Methods: `:Destroy()`, `:Clone()`, `:FindFirstChild(name)`, `:IsA(className)`.
Events: `.Touched:Connect(function(otherPart) end)` (parts), `.MouseButton1Click` and `.Activated` (buttons), `.Event` (BindableEvent), `.OnServerEvent` / `.OnClientEvent` (RemoteEvent).
Methods on events objects: `BindableEvent:Fire(...)`, `RemoteEvent:FireServer(...)`, `:FireClient(player, ...)`, `:FireAllClients(...)`. (OnServerEvent callbacks receive the player table first.)

## Parts (Part, SpawnLocation, Seat, VehicleSeat, TrussPart, MeshPart)
`Position` (Vector3, studs), `Orientation` (Vector3, degrees, order Y-X-Z), `Size` (Vector3), `Color` (Color3), `Material` (Plastic, Wood, Slate, Concrete, Brick, Sand, Grass, Metal, Foil, Glass, Ice, Neon), `Reflectance`, `Transparency` (0–1), `Shape` (Block, Ball, Cylinder – visual only; collision is a box), `Anchored`, `CanCollide`, `CanTouch`, `Locked` (blocks editor selection), `CastShadow`, `Density`, `Friction`, `Elasticity`, `AssemblyLinearVelocity` (Vector3, studs/s).
- Collision uses true oriented boxes, so rotated parts have rotated hitboxes.
- Gravity 196.2 studs/s². Player walk speed 16, jump velocity 50, auto-climbs steps up to ~1.5 studs, does not bounce.
- Anchored parts never move by physics. Unanchored parts fall, collide and stack.
- SpawnLocation: the first one found is used for the character spawn.
Example: `local p=Instance.new("Part") p.Size=Vector3.new(4,1,4) p.Position=Vector3.new(0,10,0) p.Anchored=true p.Parent=workspace`

## Other simulated classes
- **WeldConstraint**: set `w.Part0` and `w.Part1` (parts) in Lua; Part1 then follows Part0 rigidly during Play. Parent it to Part0. (Links made in the editor are not saved to files.)
- **UnionOperation**: a real mesh boolean of its child parts. `Mode` = `Union` or `Intersect`; child parts with `Negative = true` are subtracted (the Negate tool). Unions are static (always anchored); collision is voxel-fitted, so cut holes are walk-through. Properties: `Color, Material, Transparency, Reflectance, Mode`. **Model**, **Folder**, **Configuration** are plain containers.
- **Value objects** (`BoolValue`, `IntValue`, `NumberValue`, `StringValue`, `Color3Value`, `Vector3Value`, `ObjectValue`): property `.Value`.
- **Lighting**: `Brightness, ClockTime (0-24), Ambient, FogColor, FogStart, FogEnd, GlobalShadows, ExposureCompensation`. **Sky**: `Color`.
- **Terrain**: `Seed, Size, Resolution, Amplitude` (procedural heightfield; changing them rebuilds it).

## UI (put inside a ScreenGui inside StarterGui)
Classes: `ScreenGui` (`Enabled`), `Frame`, `ScrollingFrame`, `CanvasGroup`, `TextLabel`, `TextButton`, `TextBox`, `ImageLabel`, `ImageButton`, plus `UICorner` (`CornerRadius` px) and `UIStroke` (`Color, Thickness, Transparency`) as children of a GUI object.
GUI properties: `Position`, `Size` (UDim2), `AnchorPoint` ({X,Y} 0–1), `Rotation`, `BackgroundColor3`, `BackgroundTransparency`, `BorderColor3`, `BorderSizePixel`, `Visible`, `ZIndex`, `ClipsDescendants`.
Text classes also: `Text`, `TextColor3`, `TextSize`, `TextTransparency`, `Font` (SourceSans, Arial, ArialBold, Gotham, Code, Fantasy, Cartoon, SciFi, Legacy), `TextXAlignment` (Left/Center/Right), `TextYAlignment` (Top/Center/Bottom), `TextWrapped`. TextBox: `PlaceholderText`; the typed text is in `.Text`. Image classes: `Image` (a web URL).
```lua
local b = script.Parent.TextButton
local n = 0
b.MouseButton1Click:Connect(function()
  n = n + 1
  b.Text = "Clicked " .. n
end)
```

## ModuleScript
```lua
-- ModuleScript named Util in ReplicatedStorage
local M = {}
function M.double(x) return x * 2 end
return M
-- usage in another script:
local Util = require(game:GetService("ReplicatedStorage").Util)
print(Util.double(4))
```

## Common patterns
```lua
-- kill brick
part.Touched:Connect(function(hit)
  if hit.Name == "Player" then hit.Position = Vector3.new(0, 10, 0) end
end)
-- spin / animate with Heartbeat (no CFrame; change Orientation)
local a = 0
game:GetService("RunService").Heartbeat:Connect(function(dt)
  a = a + 90 * dt
  part.Orientation = Vector3.new(0, a, 0)
end)
-- loop with wait
while true do wait(1) print("tick") end
```

## Stored-only classes (can be inserted, edited, scripted and saved, but have NO behaviour yet)
Constraints: HingeConstraint, SpringConstraint, RopeConstraint, BallSocketConstraint, RodConstraint, PrismaticConstraint, Attachment, BodyVelocity, BodyForce, BodyGyro, BodyPosition. Effects: PointLight, SpotLight, SurfaceLight, Fire, Smoke, Sparkles, ParticleEmitter, Beam, Trail, Sound, Decal, Texture, Atmosphere, Clouds, BloomEffect, BlurEffect, ColorCorrectionEffect, SunRaysEffect, DepthOfFieldEffect. UI: UIListLayout, UIGridLayout, UIPadding, UIGradient, UIAspectRatioConstraint, UIScale, SurfaceGui, BillboardGui. Other: Tool, NegateOperation.
Do not rely on these doing anything; implement the behaviour in Lua with parts and Heartbeat instead.

## Not available
CFrame, Humanoid, Players.PlayerAdded, DataStores, HttpService, TweenService, RemoteFunction/BindableFunction, raycasting (`workspace:Raycast`), GetChildren (use `children()`), operators on Vector3.
