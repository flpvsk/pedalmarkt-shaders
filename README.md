Code for the TV in the display window of Pedal Markt.

## Requirements

* [glslViewer](https://github.com/patriciogonzalezvivo/glslViewer)
* [python3](https://www.python.org/downloads/)
* [Folder of assets](https://drive.google.com/drive/folders/1lgjRLbbvZuYJF8BKc0wfflkvU1bMVKeY?usp=sharing)

## Running locally

1. Download the `assets` folder and place into the root of
   the project;

2. Run

    ```bash
    python3 run.py
    ```

3. To see different options available in the script, run

    ```bash
    python3 run.py -h
    ```

## Adding a scene

Scenes in the project are written as fragment shaders (aka
pixel shaders). To add a scene:

1. Add a shader function in a separate file, see
   `src/march.glsl` as an example. Use a unique function
   name;

2. Include the new `.glsl` file into `src/main.glsl`;

3. Increment the scene number, add an `#ifdef` condition in
   the main function for the variable `SCENE_X`

4. Add the scene name to the `scene_names` array in
   `./run.py`

## Formatting python code

```bash
python3 -m pyink --pyink-indentation 2 run.py
```



