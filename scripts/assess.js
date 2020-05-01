const fetch = require('node-fetch');
const web3 = require('web3');
const Coinosis = artifacts.require('Coinosis');
const settings = require('../src/settings.json');

const environment = process.env.NODE_ENV || 'development';
const backend = settings[environment].backend;
const etherscanAPI = 'https://api.etherscan.io/api';
const etherscanKey = '2RU78DJDPVG9G2VK3AHE8QVTAN65CP9MBI';
const gasTracker = `${etherscanAPI}?module=gastracker&action=gasoracle&apikey=${etherscanKey}`
const ETHPrice = `${etherscanAPI}?module=stats&action=ethprice&apikey=${etherscanKey}`

const registrationFeeUSD = '3';

module.exports = callback => {
  getUsers(callback);
}

const getUsers = callback => {
  fetch(backend + '/users')
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    }).then(users => {
      getAssessments(users, callback);
    }).catch(error => {
      callback(error);
    });
}

const getAssessments = (users, callback) => {
  fetch(backend + '/assessments')
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    }).then(assessments => {
      getClaps(users, assessments, callback);
    }).catch(error => {
      callback(error);
    });
}

const getClaps = (users, assessments, callback) => {
  const addresses = users.map(user => user.address);
  const names = addresses.map(address =>
    users.find(user => user.address === address).name
  );
  const totalAssessment = {};
  for (const i in addresses) {
    totalAssessment[addresses[i]] = 0;
  }
  for (const i in assessments) {
    const assessment = assessments[i].assessment;
    for (const j in addresses) {
      const address = addresses[j];
      if (address in assessment) {
        totalAssessment[address] += assessment[address];
      }
    }
  }
  const claps = addresses.map(address => totalAssessment[address]);
  getETHPrice(names, addresses, claps, callback);
}

const getETHPrice = (names, addresses, claps, callback) => {
  fetch(ETHPrice)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    }).then(data => {
      if (data.status !== '1') callback(data);
      const ETHPriceUSD = data.result.ethusd;
      const ETHPriceUSDWei = web3.utils.toWei(ETHPriceUSD);
      getGasPrice(ETHPriceUSDWei, names, addresses, claps, callback);
    }).catch(error => {
      callback(error);
    });
}

const getGasPrice = (ETHPriceUSDWei, names, addresses, claps, callback) => {
  fetch(gasTracker)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    }).then(data => {
      if (data.status !== '1') callback(data);
      const gasPriceGwei = data.result.ProposeGasPrice;
      const gasPrice = web3.utils.toWei(gasPriceGwei, 'gwei');
      callContract(gasPrice, ETHPriceUSDWei, names, addresses, claps, callback);
    }).catch(error => {
      callback(error);
    });
}

const callContract = (
  gasPrice,
  ETHPriceUSDWei,
  names,
  addresses,
  claps,
  callback
) => {
  Coinosis.deployed().then(instance => {
    const registrationFeeUSDWei = web3.utils.toWei(registrationFeeUSD);
    console.log(gasPrice);
    console.log(registrationFeeUSDWei);
    console.log(ETHPriceUSDWei);
    console.log(names);
    console.log(addresses);
    console.log(claps);
    instance.assess(
      registrationFeeUSDWei,
      ETHPriceUSDWei,
      names,
      addresses,
      claps,
      {gasPrice}
    ).then(result => {
      console.log(result);
      callback();
    });
  }).catch(error => {
    callback(error);
  });
}
