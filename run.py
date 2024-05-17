import asyncio
import subprocess
import os
import random

async def main():
  cmd = [
    'glslViewer',
    'src/main.frag',
    '-u_perryMonochrome', 'assets/perry-monochrome.png',
    '-u_paperTexture', 'assets/copyscan14.jpg',
    '-u_textTexture', 'assets/pedal-expo-text.png',
    '-fps', '12',
    '-f',
    # '-w', '400', '-h', '300',
    '--audio',
    '--noncurses',
    '--nocursor',
  ]
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

  while (True):
    if (proc.stdin == None):
      return

    prev_scene = show_scene(proc, scope_scene, prev_scene)
    await asyncio.sleep(44)
    prev_scene = show_scene(proc, text_scene, prev_scene)
    await asyncio.sleep(12)
    prev_scene = show_scene(
        proc,
        random.choice(other_scenes),
        prev_scene
    )
    await asyncio.sleep(22)

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
