// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodide: any;

export async function initializeEngine() {
  console.debug("Loading interpreter...");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pyodide = await (window as any).loadPyodide();
  await runPython('print("Interpreter works!")');
  console.debug("Loaded interpreter.");

  console.debug("Loading engine...");
  await runPython(`
      from pyodide.http import pyfetch
      response = await pyfetch("/cashflow-projector/dist.tar.gz")
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
  const rawHandle = pyodide.globals.get(name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args: any[]) => {
    const startTime = Date.now();

    const response = rawHandle(...args);

    const endTime = Date.now();
    console.info(`calling ${name} took ${endTime - startTime}ms`);

    return response;
  };
}
