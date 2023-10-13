import asyncio
import subprocess

async def main():
  print('start')
  cmd = [
    'glslViewer',
    'src/main.frag',
    '-u_perryMonochrome assets/perry-monochrome.png',
    '-u_paperTexture assets/copyscan14.jpg',
    '-noncurses',
    '-w 100 -h 100',
  ]
  proc = subprocess.Popen(
    cmd,
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    encoding='utf8',
    shell=True
  )
  await asyncio.sleep(4)
  proc.communicate(input='defines,SCENE_2\n')
  await asyncio.sleep(1000)

asyncio.run(main())
