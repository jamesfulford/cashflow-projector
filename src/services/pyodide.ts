let pyodide: any;

export async function initializeEngine() {
  console.debug("Loading interpreter...");
  pyodide = await (window as any).loadPyodide();
  await runPython('print("Interpreter works!")');
  console.debug("Loaded interpreter.");

  console.debug("Loading engine...");
  await runPython(`
      from pyodide.http import pyfetch
      response = await pyfetch("/solomon-app/dist.tar.gz")
      await response.unpack_archive()
  `);
  await Promise.all([pyodide.loadPackage("python-dateutil")]);
  await runPython("from engine.pyodide import *");
  console.debug("Loaded engine.");
}

export async function runPython(statement: string) {
  return pyodide.runPythonAsync(statement);
}

export function getGlobal(name: string) {
  return pyodide.globals.get(name);
}
