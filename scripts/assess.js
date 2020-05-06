const fetch = require('node-fetch');
const web3 = require('web3');
const Coinosis = artifacts.require('Coinosis');
const settings = require('../src/settings.json');

const environment = process.env.ENVIRONMENT || 'development';
const backend = settings[environment].backend;
const etherscanAPI = 'https://api.etherscan.io/api';
const etherscanKey = '2RU78DJDPVG9G2VK3AHE8QVTAN65CP9MBI';
const gasTracker = `${etherscanAPI}?module=gastracker&action=gasoracle&apikey=${etherscanKey}`
const ETHPrice = `${etherscanAPI}?module=stats&action=ethprice&apikey=${etherscanKey}`
const dateOptions = {
  timeZone: 'America/Bogota',
  timeStyle: 'medium',
  dateStyle: 'medium',
};

const registrationFeeUSD = '3';
const eventURL = 'kafka-connect';

module.exports = callback => {
  getAttendees(callback);
}

const getAttendees = callback => {
  fetch(`${backend}/event/${eventURL}/attendees`)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    }).then(attendees => {
      getAssessments(attendees, callback);
    }).catch(error => {
      callback(error);
    });
}

const getAssessments = (attendees, callback) => {
  fetch(`${backend}/assessments/${eventURL}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    }).then(assessments => {
      getClaps(attendees, assessments, callback);
    }).catch(error => {
      callback(error);
    });
}

const getClaps = (attendees, assessments, callback) => {
  const addresses = attendees.map(user => user.address);
  const names = addresses.map(address =>
    attendees.find(attendee => attendee.address === address).name
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
    console.log(
      'registration fee:',
      web3.utils.fromWei(registrationFeeUSDWei),
      'USD'
    );
    console.log('ETH price:', web3.utils.fromWei(ETHPriceUSDWei), 'USD');
    console.log('names:', names);
    console.log('addresses:', addresses);
    console.log('claps:', claps);
    console.log(
      'gas price:',
      web3.utils.toWei(web3.utils.fromWei(gasPrice), 'gwei'),
      'gwei'
    );
    console.log('press enter to send transaction');
    process.stdin.on('data', () => {
      instance.assess(
        registrationFeeUSDWei,
        ETHPriceUSDWei,
        names,
        addresses,
        claps,
        {gasPrice}
      ).then(result => {
        for (const i in result.logs) {
          const log = result.logs[i];
          console.log(log.event);
          for (const name in log.args) {
            if (!isNaN(name) || name === '__length__') continue;
            const arg = log.args[name];
            if (typeof arg === 'object') {
              const value = arg.toString();
              if (name === 'timestamp') {
                const date = new Date(Number(value + '000'));
                console.log(name, ':', date.toLocaleString('es-CO', dateOptions));
              } else if(isNaN(value) || name.indexOf('laps') !== -1) {
                console.log(name, ':', value);
              } else {
                console.log(name, ':', web3.utils.fromWei(value));
              }
            } else {
              console.log(name, ':', arg);
            }
          }
          console.log('\n')
        }
        const gasUsed = result.receipt.gasUsed;
        const txFeeWei = gasUsed * gasPrice;
        const txFee = txFeeWei / 1e18;
        const ETHPriceUSD = ETHPriceUSDWei / 1e18;
        const txFeeUSD = (txFee * ETHPriceUSD).toFixed(2);
        console.log('gas used:', gasUsed);
        console.log('tx fee:', txFee, 'ETH');
        console.log('tx fee:', txFeeUSD, 'USD');
        process.stdin.pause();
        callback();
      });
    });
  }).catch(error => {
    callback(error);
  });
}
