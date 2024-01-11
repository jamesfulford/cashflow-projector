# Solomon

## TODO

- use https://www.npmjs.com/package/browser-fs-access to remove localstorage dependency (add step to read from filesystem)

- Plan Selector: Pick a file or create a new plan (default)
- Plan Selector: load pyodide in background
- Plan Selector: that's not a valid plan file!
- Header: "Editing {plan.json}" (change document title too for easier multi-tab experience)
- Header: "Go back to plan selector menu"
- Header: Save button (and cmd+s shortcut), feedback toast, deactivate after use, re-activate after rules or parameter change, autosave setting to hit save after reactivation
- Services: remove localstorage reliance so can multi-tab this app
- State: anything else I want to persist? DurationSelector choice?

- improve rules listing (sort by financial impact; search)
- improve reconciliation (use a modal; list expected transactions between then and now)

## Ideas

- come up with a good name
- add raw input for RRULE strings and link to here: https://jkbrzt.github.io/rrule/
- add back Hebrew (Hillel) calendar (Python support not working due to micropip)
- add how-to video link in footer
- get a good UX from someone smart
