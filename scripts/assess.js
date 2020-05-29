const fetch = require('node-fetch');
const web3 = require('web3');
const Coinosis = artifacts.require('Coinosis');
const settings = require('../settings.json');

const environment = process.env.ENVIRONMENT || 'development';
const backend = settings[environment].backend;
const etherscanAPI = 'https://api.etherscan.io/api';
const etherscanKey = '2RU78DJDPVG9G2VK3AHE8QVTAN65CP9MBI';
const gasTracker = `${etherscanAPI}?module=gastracker&action=gasoracle`
      + `&apikey=${etherscanKey}`;
const ETHPrice =
      `${etherscanAPI}?module=stats&action=ethprice&apikey=${etherscanKey}`;
const dateOptions = {
  timeZone: 'America/Bogota',
  timeStyle: 'medium',
  dateStyle: 'medium',
};

const usage =
      'usage: [ENVIRONMENT=<environment>] truffle exec scripts/assess.js '
      + '<eventURL> <registrationFeeUSD> --network <network>\n';

module.exports = callback => {
  const argv = process.argv.slice(4);
  if (argv.length !== 4 || argv[2] !== '--network') {
    callback(usage);
  }
  const eventURL = argv[0];
  const registrationFeeUSD = argv[1];
  const network = argv[3]
  getAttendees(eventURL, registrationFeeUSD, network, callback);
}

const getAttendees = (eventURL, registrationFeeUSD, network, callback) => {
  fetch(`${backend}/event/${eventURL}/attendees`)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    }).then(attendees => {
      getAssessments(
        eventURL,
        registrationFeeUSD,
        attendees,
        network,
        callback
      );
    }).catch(error => {
      callback(error);
    });
}

const getAssessments = (
  eventURL,
  registrationFeeUSD,
  attendees,
  network,
  callback
) => {
  fetch(`${backend}/assessments/${eventURL}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.status);
      }
      return response.json();
    }).then(assessments => {
      getClaps(
        eventURL,
        registrationFeeUSD,
        attendees,
        assessments,
        network,
        callback
      );
    }).catch(error => {
      callback(error);
    });
}

const getClaps = (
  eventURL,
  registrationFeeUSD,
  attendees,
  assessments,
  network,
  callback
) => {
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
  getETHPrice(
    eventURL,
    registrationFeeUSD,
    names,
    addresses,
    claps,
    network,
    callback
  );
}

const getETHPrice = (
  eventURL,
  registrationFeeUSD,
  names,
  addresses,
  claps,
  network,
  callback
) => {
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
      getGasPrice(
        eventURL,
        registrationFeeUSD,
        ETHPriceUSDWei,
        names,
        addresses,
        claps,
        network,
        callback
      );
    }).catch(error => {
      callback(error);
    });
}

const getGasPrice = (
  eventURL,
  registrationFeeUSD,
  ETHPriceUSDWei,
  names,
  addresses,
  claps,
  network,
  callback
) => {
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
      callContract(
        eventURL,
        registrationFeeUSD,
        gasPrice,
        ETHPriceUSDWei,
        names,
        addresses,
        claps,
        network,
        callback
      );
    }).catch(error => {
      callback(error);
    });
}

const callContract = (
  eventURL,
  registrationFeeUSD,
  gasPrice,
  ETHPriceUSDWei,
  names,
  addresses,
  claps,
  network,
  callback
) => {
  Coinosis.deployed().then(instance => {
    const registrationFeeUSDWei = web3.utils.toWei(registrationFeeUSD);
    console.log('event URL:', eventURL);
    console.log('registration fee:', registrationFeeUSD, 'USD');
    console.log('number of attendees:', addresses.length);
    console.log(
      'total amount to be distributed:',
      registrationFeeUSD * addresses.length,
      'USD'
    );
    console.log('ETH price:', web3.utils.fromWei(ETHPriceUSDWei), 'USD');
    console.log('names:', names);
    console.log('attendees:', addresses);
    console.log('claps:', claps);
    console.log(
      'gas price:',
      web3.utils.toWei(web3.utils.fromWei(gasPrice), 'gwei'),
      'gwei'
    );
    console.log('environment:', environment);
    console.log('network:', network, '\n');
    if (network === 'mainnet') {
      console.log('\n\nWARNING: this is a MAINNET transaction.',
                  'Real money is involved.\n\n');
    }
    console.log('press enter to send transaction, Ctrl+C to cancel');
    process.stdin.on('data', () => {
      instance.assess(
        eventURL,
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
                console.log(
                  name,
                  ':',
                  date.toLocaleString('es-CO', dateOptions)
                );
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
      }).catch(error => {
        callback(error);
      });
    });
  }).catch(error => {
    callback(error);
  });
}
