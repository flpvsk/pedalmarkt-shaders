import asyncio
import subprocess
import os
import random
import argparse

async def main():
  parser = argparse.ArgumentParser(add_help=False)
  parser.add_argument(
    '-f',
    '--fullscreen',
    type=bool,
    default=False
  )
  parser.add_argument(
    '-a',
    '--audio',
    type=bool,
    default=False
  )
  parser.add_argument('-w', '--width', type=int, default=400)
  parser.add_argument('-h', '--height', type=int, default=300)
  args = parser.parse_args()

  cmd = [
    'glslViewer',
    'src/main.frag',
    '-u_perryMonochrome', 'assets/perry-monochrome.png',
    '-u_paperTexture', 'assets/copyscan14.jpg',
    '-u_textTexture', 'assets/pedal-expo-text.png',
    '-fps', '12',
    '--noncurses',
    '--nocursor',
    # '-f',
    # '-w', '400', '-h', '300',
    # '--audio',
  ]

  if args.fullscreen:
    cmd.append('-f')

  if args.audio:
    cmd.append('-a')

  if (
    not args.fullscreen
    and args.width > 0
    and args.height > 0
  ):
    cmd.append('-w')
    cmd.append(str(args.width))
    cmd.append('-h')
    cmd.append(str(args.height))

  print(cmd)

  proc = subprocess.Popen(
    cmd,
    stdin=subprocess.PIPE,
    encoding='utf8',
    env={
      'DISPLAY': ':0.0',
      'PATH': os.environ['PATH'],
    },
  )

  await asyncio.sleep(1)
  scope_scene = 0
  text_scene = 5
  other_scenes = [ 1, 2, 3, 4]
  prev_scene = 6
  text_scene_probability = 0.3

  if args.audio:
    other_scenes.append(scope_scene)

  while (True):
    if (proc.stdin == None):
      return

    if random.random() < text_scene_probability:
      prev_scene = show_scene(proc, text_scene, prev_scene)
      await asyncio.sleep(12)

    prev_scene = show_scene(
        proc,
        random.choice(other_scenes),
        prev_scene
    )

    await asyncio.sleep(32)

def show_scene(proc, scene, prev_scene):
    if scene == prev_scene:
      prev_scene = 100

    proc.stdin.write(
      'defines,SCENE_{}\nundefine,SCENE_{}\n'.format(
        scene + 1,
        prev_scene + 1
      )
    )
    proc.stdin.flush();
    return scene

asyncio.run(main())
