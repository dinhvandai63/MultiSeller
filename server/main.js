const exec = require('child_process');
//read file
const fs = require('fs');
var proof;
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path')

app.use(express.static('client'));
app.use(express.static('build/contracts'));

app.get('/', (req, res) => {
  console.log("you /");
  res.sendFile('index.html', {
    root: path.join(__dirname, '../client/')
  })
});

app.use(express.json());
app.get('/buyitem/:id/:name/:price/:details', async (req, res) => {
  const id = parseInt(req.params.id);
  const name = req.params.name;
  const price = req.params.price;
  const details = req.params.details;

  console.log(id + " " + name + " " + price + " " + details);
  // create contract verifyTx
  try {
    var temp = await main(id + name + price + details);
    // temp.then(x => console.log("this is temp "+x[2]));
  } catch (err) {
    console.log("this error in get /buyItem/.. " + err);
    res.send({ erro: err });
  }
  console.log("below is temp 3: ");
  console.log(temp);
  // var temp =  [];
  // temp[0] = 0;
  // temp[1] = 0;
  res.send({ output0: temp[0], output1: temp[1] });
});

//run verifier contract
app.get('/runverifyTx/:id/:name/:price/:details/:out0/:out1', async (req, res) => {
  //read request
  const id = parseInt(req.params.id);
  const name = req.params.name;
  const price = req.params.price;
  const details = req.params.details;
  const out0 = req.params.out0;
  const out1 = req.params.out1;
  console.log("this params req runverifyTx:")
  console.log(id + " " + name + " " + price + " " + details);
  //run sh create witness and proof
  //read proof file
  try { 
    var temp = await createProof(id + name + price + details, out0, out1);
    //send to client
    console.log("below is temp 3 temp.a: ");
    console.log(temp.proof.a);
    res.send({proof_data: temp });//, output1: temp[1]
  } catch (err) {
    console.log("this error in get /runverifyTx/.. " + err);
    res.send({ erro: err });
  }
});
//run save-file
app.get('/save-file/:id/:name/:price/:details', async (req, res) => {
  
  //read request
  const id = parseInt(req.params.id);
  const name = req.params.name;
  const price = req.params.price;
  const details = req.params.details;

  console.log("this params req save-file:")
  console.log(id + " " + name + " " + price + " " + details);
  //try to save file
  try { 
    var package = {
      "id" : id,
      "name" : name,
      "price" : price,
      "details": details
    }    
    await writeSellerValue(package);

    res.send({value: {data: "welwle"} });
  } catch (err) {
    console.log("this error in get /save-file/.. " + err);
    res.send({ erro: err });
  }
});

//run read-file
app.get('/read-infor-package/:id', async (req, res) => {
  //read request
  const id = parseInt(req.params.id);
 
  console.log("this params req save-file:")
  console.log(id);
  //try to save file
  try {   
    let package = await readSellerPackages(id);

    res.send(package);
  } catch (err) {
    console.log("this error in get /save-file/.. " + err);
    res.send({ erro: err });
  }
});

app.get('*', (req, res) => {
  res.status(404);
  res.send('Ooops... this URL does not exist 30');
});

app.listen(PORT, () => {
  console.log(`COD running on port ${PORT}...`);
});
// The documentation also states that the default value of maxBuffer is 200KB
// in here, the maximum buffer size is increased to 500KB
async function sh_zokrates(cmd) {
  return new Promise(function (resolve, reject) {
    exec.exec('export ZOKRATES_HOME=$HOME/.zokrates/stdlib ;' + cmd, { maxBuffer: 1024 * 1204 * 500 }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function sh(cmd) {
  return new Promise(function (resolve, reject) {
    exec.exec(cmd, { maxBuffer: 1024 * 1204 * 500 }, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

async function main(data_in) {
  var result = [];
  var i = 1;
  //data_int to int
  var data_in_int = convertStringToInt(data_in)

  //~~~~~~~~~~~1
  await sh_zokrates('$HOME/.zokrates/bin/zokrates compile -i hashexample.code');
  await sh_zokrates('$HOME/.zokrates/bin/zokrates compute-witness -a 0 0 0 ' + data_in_int);
  let { stdout } = await sh_zokrates("grep '~out' witness");

  //read out1, out0, and repair send for user
  for (let line of stdout.split('\n')) {
    for (let word of line.split(' ')) {
      if (word == '~out_1' || word == '~out_0' || word == '') {
        continue;
      }
      result[i] = word; //result[1] = ~out_1 and result[0] = ~out_0
      i--;
      console.log(`ls: \`${word}\``);
    }
  }
  //~~~~~~~~~~~2
  //compile -> setup create verifyKey, proveKey -> export contract verifier
  await sh_zokrates('$HOME/.zokrates/bin/zokrates compile -i hashexample2.code');
  console.log("done example2");
  await sh_zokrates('$HOME/.zokrates/bin/zokrates setup');
  console.log("done setup");
  await sh_zokrates('$HOME/.zokrates/bin/zokrates export-verifier');

  console.log("done verifier");
  //move contract verifier to folder contracts
  // await sh('rm ./build/contracts/Verifier.json ./build/contracts/BN256G2.json');
  await sh('mv -f ./verifier.sol ./contracts/');
  await sh('truffle compile');
  console.log("done truffle compile");
  return result;
}

async function createProof(_data_in, _out0, _out1) {
  //data_int to int
  var data_in_int = convertStringToInt(_data_in)
  try {
    //seller compute witness, proof and send contract
    await sh_zokrates('$HOME/.zokrates/bin/zokrates compute-witness -a 0 0 0 '
      + data_in_int + " " + _out0 + " " + _out1);
    console.log("done compute witness with 6 paramater");

    
    await sh_zokrates('$HOME/.zokrates/bin/zokrates generate-proof');
    console.log("done generate-proof");

    var proof_data;
    //read proof and send value proof to seller
    proof_data = await readDataJson('./proof.json');
    console.log("this proof 2: ");
    console.log(proof_data);
    console.log("this proof a: ");
    console.log(proof_data.proof.a);
  } catch (error) {
    console.log("create proof " + error);
  }
  return proof_data;
}

//input path and read json from path
// const util = require('util');
// const readdir = util.promisify(fs.readFile);

async function readDataJson(_string) {
  return new Promise(function (resolve, reject) {
    fs.readFile(_string, 'utf8', (err, jsonString) => {
      if (err) {
        console.log("Error reading file from disk:", err);
        reject(err);
      }
      try {
        proof_data = JSON.parse(jsonString);
        console.log("your proof a in function readData: 1", proof_data.proof.a);
        resolve(proof_data);
      } catch (err) {
        console.log('Error parsing JSON string:', err);
        reject(err);
      }
    })
  });
}

async function writeSellerValue(package) {
  var package_temp = package;
  let obj = {
    table: []
  };
  if(package_temp.id == 0){
    await sh_zokrates('rm packages.json');
  }
  fs.exists('packages.json', function (exists) {
    if (exists) {
      console.log("yes file exists");
      fs.readFile('packages.json', function readFileCallback(err, data) {

        if (err) {
          console.log(err);
        } else {
          // obj = JSON.parse(data);
          var data_temp = JSON.parse(data);
          for (i = 0; i < data_temp.table.length; i++) {
            var temp = data_temp.table[i];
            var package = temp.package;
            obj.table.push({
              package
            });
          }
          var package = package_temp;
          obj.table.push({
            package
          });

          let json = JSON.stringify(obj);
          fs.writeFile('packages.json', json, function(err, result) {
            if(err) console.log('error', err);
          });

        }
      });
    } else {
      obj.table.push({
        package
      });

      let json = JSON.stringify(obj);
      fs.writeFile('packages.json', json, function(err, result) {
        if(err) console.log('error', err);
      });
    }
  });

}
//read value from packages json when seller run verirify
async function readSellerPackages(index) {
  return new Promise(function (resolve, reject) {
    fs.readFile('packages.json', 'utf8', (err, jsonString) => {
      if (err) {
        console.log("Error reading file from disk:", err);
        reject(err);
      }
      try {
        package = JSON.parse(jsonString);
        resolve(package.table[index]);
      } catch (err) {
        reject(err);
      }
    })
  });
}
function multiply(x, y) {
  return x * y;
} // there is no semicolon here

//string to array[Int]
function convertStringToInt(_string) {
  var str = _string;
  var code = new Array(str.length);
  var result = 0;
  for (var i = 0; i < str.length; i++) {
    code[i] = str.charCodeAt(i);
  }
  for (var i = 0; i < str.length; i++) {
    //wikness security, in here must add chart(int) not total;
    result += code[i];
  }
  return result;
}

