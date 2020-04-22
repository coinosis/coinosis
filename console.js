instance = await Coinosis.deployed()
web3.eth.sendTransaction({from: accounts[0], to: instance.address, value: web3.utils.toWei('2')})

registrationFeeUSDWei = web3.utils.toWei('5')
ETHPriceUSDWei = web3.utils.toWei('187.79')
names = ['Alejandra Arias', 'Valentina Jaramillo', 'Laura Acosta', 'María de Sagarminaga', 'Camila Ríos', 'Daniela Rodríguez', 'Cristina Pabón', 'Gabriela Dávila', 'Valentina Figueroa']
addresses = accounts.slice(1)
claps = [8, 10, 4, 7, 3, 6, 4, 7, 4]
await instance.assess(registrationFeeUSDWei, ETHPriceUSDWei, names, addresses, claps)

registrationFeeUSDWei = web3.utils.toWei('17.28')
ETHPriceUSDWei = web3.utils.toWei('438.02')
names = ['Juan Pablo Acosta', 'Alejandro Salcedo', 'Juan Felipe García', 'Pedro David Malaver', 'Alejandro Pardo', 'Juan Sebastián Rickermann']
addresses = ['0x490f5FE06fb41AE672d26e60CC7D2AfC167A4448', '0xd8cDd5b63c2b7e62C48DA8912FdF573E85bb18fA', '0x5385c5697EE0eA3973eC269F74F1B7AE6F9f3a2B', '0x034f854B44D28E26386c1BC37ff9B20C6380b00d', '0x03eE1201AB4d606D32A5Dcc8E4CeC01077f49D6E', '0xF0D9FcB4FefdBd3e7929374b4632f8AD511BD7e3']
claps = [8, 8, 4, 6, 2, 10]
await instance.assess(registrationFeeUSDWei, ETHPriceUSDWei, names, addresses, claps)

registrationFeeUSDWei = web3.utils.toWei('30')
ETHPriceUSDWei = web3.utils.toWei('200')
names = ['Juan Manuel Silva', 'Janeth Escobar', 'Nuria Schlenker']
addresses = ['0x133c4F653D6031578b422f12848d532D59b2C067', '0x51bad7971236540092c60D8bF559725c6bFA507B', '0x0597Fdc7F4944F9d8E4157A6E3846aEdD6f8D270']
claps = [10, 0, 78]
await instance.assess(registrationFeeUSDWei, ETHPriceUSDWei, names, addresses, claps)
