import asyncio
import subprocess
import os
import random
import argparse

scene_names = [
    "scope",
    "rules",
    "shape",
    "comet",
    "march",
    "text",
]


async def main():
  parser = argparse.ArgumentParser()
  parser.add_argument(
      "-f",
      "--fullscreen",
      type=bool,
      action=argparse.BooleanOptionalAction,
      default=False,
      help="fullscreen mode, window size arguments will be ignored (default: %(default)s)",
  )
  parser.add_argument(
      "-a",
      "--audio",
      type=bool,
      action=argparse.BooleanOptionalAction,
      default=False,
      help='enable audio input and add audio-reactive "scope" scene (default: %(default)s)',
  )
  parser.add_argument(
      "-ww",
      "--width",
      type=int,
      default=400,
      help="window width (default: %(default)s)",
  )
  parser.add_argument(
      "-wh",
      "--height",
      type=int,
      default=300,
      help="window height (default: %(default)s)",
  )
  parser.add_argument(
      "-s",
      "--scene",
      choices=list(range(len(scene_names))) + scene_names,
      help="play only one of the scenes, accepts an index or a scene name",
  )
  args = parser.parse_args()
  scene_idx = None

  if args.scene.isdecimal():
    scene_idx = int(args.scene.idx)
    if scene_idx < 0 and scene_idx >= len(scene_names):
      scene_idx = None

  if args.scene and scene_idx == None:
    for i in range(len(scene_names)):
      if scene_names[i] == args.scene:
        scene_idx = i
        break

  cmd = [
      "glslViewer",
      "src/main.frag",
      "-u_perryMonochrome",
      "assets/perry-monochrome.png",
      "-u_paperTexture",
      "assets/paper.jpg",
      "-u_textTexture",
      "assets/pedal-expo-text.png",
      "-fps",
      "12",
      "--noncurses",
      "--nocursor",
      # '-f',
      # '-w', '400', '-h', '300',
      # '--audio',
  ]

  if args.fullscreen:
    cmd.append("-f")

  if args.audio:
    cmd.append("-a")

  if not args.fullscreen and args.width > 0 and args.height > 0:
    cmd.append("-w")
    cmd.append(str(args.width))
    cmd.append("-h")
    cmd.append(str(args.height))

  print(cmd)

  proc = subprocess.Popen(
      cmd,
      stdin=subprocess.PIPE,
      encoding="utf8",
      env={
          "DISPLAY": ":0.0",
          "PATH": os.environ["PATH"],
      },
  )

  await asyncio.sleep(1)
  scope_scene = 0
  text_scene = 5
  skip_text_scene = False
  other_scenes = [1, 2, 3, 4]
  prev_scene = 6
  text_scene_probability = 0.3

  if scene_idx != None:
    skip_text_scene = True
    other_scenes = [scene_idx]

  if args.audio:
    other_scenes.append(scope_scene)

  while True:
    if proc.stdin == None:
      return

    if random.random() < text_scene_probability and not skip_text_scene:
      prev_scene = show_scene(proc, text_scene, prev_scene)
      await asyncio.sleep(12)

    prev_scene = show_scene(proc, random.choice(other_scenes), prev_scene)

    await asyncio.sleep(32)


def show_scene(proc, scene, prev_scene):
  if scene == prev_scene:
    prev_scene = 100

  proc.stdin.write(
      "defines,SCENE_{}\nundefine,SCENE_{}\n".format(scene + 1, prev_scene + 1)
  )
  proc.stdin.flush()
  return scene


asyncio.run(main())
