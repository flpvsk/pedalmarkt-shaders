import asyncio
import subprocess
import os

async def main():
  cmd = [
    'glslViewer',
    'src/main.frag',
    '-u_perryMonochrome', 'assets/perry-monochrome.png',
    '-u_paperTexture', 'assets/copyscan14.jpg',
    '-fps', '8',
    '-f',
    # '-w', '400', '-h', '300',
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
  scene = 0
  scenes = 4

  while (True):
    prev_scene = (scene - 1) % scenes
    print(
      'Scene {}, prev scene {}'.format(
        scene + 1, prev_scene +1
      )
    )

    if (proc.stdin == None):
      return

    proc.stdin.write(
      'defines,SCENE_{}\nundefine,SCENE_{}\n'.format(
        scene + 1,
        prev_scene + 1
      )
    )
    proc.stdin.flush();

    scene = (scene + 1) % scenes
    await asyncio.sleep(24)

asyncio.run(main())
