const core = require('@actions/core');
const { parse }= require('junit2json');
const fs = require("fs");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const path = core.getInput('path');
    core.info(`Loading ${path}`)
    const data = fs.readFileSync(path)
    const junit = await parse(data);
    let summary = core.summary
      .addHeading('Test Results');

    console.log(junit.testsuite[0].testcase)
    
    for(let suite of junit.testsuite) {
      summary = summary
        .addTable(Array.from(testcaseToRows(suite.testcase)))
    }
    await summary.write()
  } catch (error) {
    core.setFailed(error.message);
  }
}

function *testcaseToRows(testcase) {
  let lastClassName = "";
  for(let test of testcase) {
    if(lastClassName != test.classname) {
      lastClassName = test.classname;
      yield [{header: true, data: test.classname, colspan:3}]
    }
    yield [test.failure?"❌":"✅", `<span style="color: red">${test.name}</span>`, `${test.time}s`]
  }
}

run();
