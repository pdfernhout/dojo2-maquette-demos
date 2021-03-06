define(["require", "exports", '../vendor/maquette/maquette'], function (require, exports, maquette) {
    var h = maquette.h;
    var projector = maquette.createProjector({});
    var minPrecision = 0;
    var maxPrecision = 9;
    var allRates = {};
    var rateValueSetters = {};
    var model = {
        amount: '100.00',
        currency: 'USD',
        precision: '2',
        currencyError: false,
        precisionError: false
    };
    function loadAllRates() {
        for (var _i = 0, _a = ratesAsCSV().split('\n'); _i < _a.length; _i++) {
            var line = _a[_i];
            var parts = line.split(',');
            var currencyRate = {
                name: parts[0],
                symbol: parts[1],
                dollarsPerUnit: parseFloat(parts[2]),
                unitsPerDollar: parseFloat(parts[3])
            };
            allRates[currencyRate.symbol] = currencyRate;
            rateValueSetters[currencyRate.symbol] = setCurrencyValue.bind(null, currencyRate.symbol);
        }
    }
    function setPrecision(event) {
        var precision = event.target.value;
        model.precision = '' + precision;
        if (getPrecision() !== parseInt(model.precision)) {
            model.precisionError = true;
        }
        else {
            model.precisionError = false;
        }
    }
    function getPrecision() {
        var precision = parseInt(model.precision);
        if (isNaN(precision))
            return 0;
        if (precision < minPrecision)
            return minPrecision;
        else if (precision > maxPrecision)
            return maxPrecision;
        return precision;
    }
    function setCurrencyValue(currency, event) {
        var newValue = event.target.value;
        model.currency = currency;
        model.amount = newValue;
        model.currencyError = isNaN(parseFloat(newValue));
    }
    function getCurrencyValue(currency) {
        if (model.currency === currency) {
            return model.amount;
        }
        // convert currency
        var currencyRate = allRates[currency];
        var amount = parseFloat(model.amount);
        var dollarAmount = amount * allRates[model.currency].dollarsPerUnit;
        var result = dollarAmount * allRates[currency].unitsPerDollar;
        if (isNaN(result)) {
            return '???';
        }
        return '' + result.toFixed(getPrecision());
    }
    function renderMaquette() {
        return h('div', { id: 'currency-converter', classes: { currencyError: model.currencyError, precisionError: model.precisionError } }, [
            h('div', [
                'Precision: ',
                h('input', { value: '' + model.precision, oninput: setPrecision, type: 'number' })
            ]),
            h('hr'),
            Object.keys(allRates).map(function (key) {
                var currencyRate = allRates[key];
                return h('div', [
                    h('span.label', currencyRate.name + ' (' + currencyRate.symbol + ')'),
                    h('input', {
                        value: getCurrencyValue(currencyRate.symbol),
                        oninput: rateValueSetters[currencyRate.symbol]
                    })
                ]);
            })
        ]);
    }
    loadAllRates();
    projector.append(document.body, renderMaquette);
    // Rates on 2016-05-31 from https://www.oanda.com/currency
    // Currency,Code,USD/1 Unit,Units/1 USD
    function ratesAsCSV() {
        return "Andorran Franc,ADF,0.1696,5.8972\nAndorran Peseta,ADP,0.006686,149.585\nUtd. Arab Emir. Dirham,AED,0.2723,3.674\nAfghanistan Afghani,AFN,0.01454,68.96\nAlbanian Lek,ALL,0.008192,126.563\nArmenian Dram,AMD,0.002094,477.71\nNL Antillian Guilder,ANG,0 .5618,1.82\nAngolan Kwanza,AOA,0.006058,166 .709\nAngolan New Kwanza,AON,0.006058,166.709\nArgentine Peso,ARS,0.07186,13.9245\nAustrian Schilling,ATS,0.08085,12.3708\nAustralian Dollar,AUD,0.7178,1.3935\nAruban Florin,AWG,0.5587,1.81\nAzerbaijan Manat,AZM,0.0001342,7453\nAzerbaijan New Manat,AZN,0.6709,1.4906\nBosnian Mark,BAM,0.5688,1.7584\nBarbados Dollar,BBD,0.5,2\nBangladeshi Taka,BDT,0.01294,80.5299\nBelgian Franc,BEF,0.02758, 36.2665 \nBulgarian Lev,BGN,0.5716,1.766\nBahraini Dinar,BHD,2.6707,0.3798\nBurundi Franc,BIF,0.0006485,1592.45\nBermudian Dollar,BMD,1,1\nBrunei Dollar,BND,0.7353,1.4049\nBolivian Boliviano,BOB,0.1485,7.0924\nBrazilian Real,BRL,0.2778,3.6071\nBahamian Dollar,BSD,1.0096,1 .003\nBhutan Ngultrum,BTN,0.01489,67.2107\nBotswana Pula,BWP,0.09021,11.3736\nBelarusian Ruble,BYR,5.06e-05,19853.7\nBelize Dollar,BZD,0.5072,2. 0616\nCanadian Dollar,CAD,0. 7657,1.3063\nCongolese Franc,CDF,0.001094,944\nSwiss Franc,CHF,1.0065,0.9938\nChilean Peso,CLP,0.001476,702.54\nChinese Yuan Renminbi,CNY,0.1519, 6.5845 \nColombian Peso,COP,0.0003308,3112.5\nCosta Rican Colon,CRC,0.001904,550.254\nCuban Convertible Peso,CUC,1,1\nCuban Peso,CUP,0 .045,23.1481\nCape Verde Escudo,CVE,0.01009,99.1304\nCyprus Pound,CYP,1.9008,0.5262\nCzech Koruna,CZK,0 .04118,24.2974\nGerman Mark,DEM,0.5688,1 .7583\nDjibouti Franc,DJF,0.005627,177.72\nDanish Krone,DKK,0.1496,6.6865\nDominican R. Peso,DOP,0.02204,46.8022\nAlgerian Dinar,DZD,0. 009091,110.984\nEcuador Sucre,ECS,4.15e-05,25587\nEstonian Kroon,EEK,0. 0711, 14.0666 \nEgyptian Pound,EGP,0.1129,8.9028\nSpanish Peseta,ESP,0.006686,149.585\nEthiopian Birr,ETB,0.04641,21.996\nEuro,EUR,1.1125,0.899\nFinnish Markka,FIM,0. 1871,5.3453\nFiji Dollar,FJD,0.4751,2.1274\nFalkland Islands Pound,FKP,1.4621,0. 6842\nFrench Franc,FRF,0.1696,5.8972\nBritish Pound,GBP,1.462,0.6841\nGeorgian Lari,GEL,0.4657,2.1472\nGhanaian Cedi,GHC,2.586e-05,39119.9\nGhanaian New Cedi,GHS,0.2586,3 .912\nGibraltar Pound,GIP,1.4621,0.6842\nGambian Dalasi,GMD,0.02378,43.65\nGuinea Franc,GNF, 0.0001367 ,7475.74\nGreek Drachma,GRD,0.003265,306.342\nGuatemalan Quetzal,GTQ,0.1338,7.8348\nGuyanese Dollar,GYD,0.005019,217. 235\nHong Kong Dollar,HKD,0.1287,7.7686\nHonduran Lempira,HNL,0 .04492,23.1625\nCroatian Kuna,HRK,0 .1493,6.7651\nHaitian Gourde,HTG,0.01611,63.8519\nHungarian Forint,HUF,0.003544,282. 447\nIndonesian Rupiah,IDR,7.34e-05,13661.2\nIrish Punt,IEP,1.4126,0.708\nIsraeli New Shekel,ILS,0.2601,3.8541\nIndian Rupee,INR,0.0149,67.2819\nIraqi Dinar,IQD,0.0008715,1201.37\nIranian Rial,IRR,3. 319e-05,30183\nIceland Krona,ISK,0.008008,125.47\nItalian Lira,ITL,0 .0005745,1740.75\nJamaican Dollar,JMD,0.008091,126.828\nJordanian Dinar,JOD,1.4168,0.7108\nJapanese Yen,JPY,0.009007,111.047\nKenyan Shilling,KES,0.01005,102.078\nKyrgyzstanian Som,KGS,0.01464,68.2986\nCambodian Riel,KHR,0.0002495,4188.31\nComoros Franc,KMF,0.002345,427.3\nNorth Korean Won,KPW,0.007407,135\nSouth-Korean Won,KRW,0.0008411,1191.61\nKuwaiti Dinar,KWD,3.3125,0.3029\nCayman Islands Dollar,KYD,1.2223,0.8541\nKazakhstan Tenge,KZT,0.002987,340.23\nLao Kip,LAK,0.0001262,8371.59\nLebanese Pound,LBP,0.0006772,1548.56\nSri Lanka Rupee,LKR,0.006904,151.128\nLiberian Dollar,LRD,0.01111,91\nLesotho Loti,LSL,0.063403,15.79382\nLithuanian Litas,LTL,0.3222,3.1041\nLuxembourg Franc,LUF,0.02758,36.2665\nLatvian Lats,LVL,1.5829,0.6318\nLibyan Dinar,LYD,0 .7399,1.4055\nMoroccan Dirham,MAD,0.1035,9. 8683\nMoldovan Leu,MDL,0.05054,20.3257\nMalagasy Ariary,MGA,0.0003124,3291.45\nMalagasy Franc,MGF,0.0001093,9150.46\nMacedonian Denar,MKD,0.0182,55.7395\nMyanmar Kyat,MMK,0.0008557,1208.12\nMongolian Tugrik,MNT,0.000502,1997\nMacau Pataca,MOP,0.1274,8.2059\nMauritanian Ouguiya,MRO, 0.002849 ,363.581\nMaltese Lira,MTL,2.5914,0.386\nMauritius Rupee,MUR,0.02942,36.6068\nMaldive Rufiyaa,MVR,0.06689,15.15\nMalawi Kwacha,MWK,0.001597,646\nMexican Peso,MXN,0.05412,18.4874\nMalaysian Ringgit,MYR,0.2433,4.1162\nMozambique Metical,MZM, 1.768e-05 ,56760\nMozambique New Metical,MZN,0.01768,56.76\nNamibia Dollar,NAD,0.063403,15.79382\nNigerian Naira,NGN,0.005076,202. 392\nNicaraguan Cordoba Oro,NIO,0.03549,29.0739\nDutch Guilder,NLG,0.5048,1.9812\nNorwegian Kroner,NOK,0.1198,8.3527\nNepalese Rupee,NPR,0.009415, 109.267 \nNew Zealand Dollar,NZD,0.6695,1.4942\nOmani Rial,OMR,2.6057,0.3864\nPanamanian Balboa,PAB,1,1\nPeruvian Nuevo Sol,PEN,0.3043,3.4304\nPapua New Guinea Kina,PGK,0.3315,3.1603\nPhilippine Peso,PHP,0.02142,46.8523\nPakistan Rupee,PKR,0 .009641,106.594\nPolish Zloty,PLN,0.2533,3.9506\nPortuguese Escudo,PTE,0.005549,180.238\nParaguay Guarani,PYG,0.00018,5789.57\nQatari Rial,QAR,0.2749,3.6452\nRomanian Lei,ROL,2.473e-05,40550.5\nRomanian New Lei,RON,0.2473,4.055\nSerbian Dinar,RSD,0.009061,111.067\nRussian Rouble,RUB,0.01518,65.9234\nRwandan Franc,RWF,0.00136,762 .434\nSaudi Riyal,SAR,0.2668,3.7526\nSolomon Islands Dollar,SBD,0 .125,8.058\nSeychelles Rupee,SCR,0.08152,13.9698\nSudanese Dinar,SDD,0.001652,614.488\nSudanese Pound,SDG,0.1652,6.1449\nSudanese Old Pound,SDP,0.0004423,2272.3\nSwedish Krona,SEK,0.1199,8.3448\nSingapore Dollar,SGD,0.724,1.3817\nSt. Helena Pound,SHP,1.5694,0.6373\nSlovenian Tolar,SIT,0.004642,215.442\nSlovak Koruna,SKK,0.03693,27.0839\nSierra Leone Leone,SLL,0.0002561,4005\nSomali Shilling,SOS,0.001797,628.382\nSuriname Dollar,SRD,0.1563,6.45\nSuriname Guilder,SRG,0.0001563,6450\nSao Tome/Principe Dobra,STD,4.54e-05,22025.9\nEl Salvador Colon,SVC,0.1168,8.9954\nSyrian Pound,SYP,0 .004589,218.2\nSwaziland Lilangeni,SZL, 0.063403 ,15.79382\nThai Baht,THB,0.02801,35.7978\nTajikistani Somoni,TJS,0.1271,7.8695\nTurkmenistan Manat,TMM,5.7e-05,17587.5\nTurkmenistan New Manat,TMT,0.2864,3.5175\nTunisian Dinar,TND,0.477,2.1066\nTonga Pa'anga,TOP,0.4341,2.3088\nTurkish Old Lira,TRL,3.381e-07,2960050\nTurkish Lira,TRY,0.3381,2.96\nTrinidad/Tobago Dollar,TTD,0.1525,6.8264\nTaiwan Dollar,TWD,0.03066,32.6566\nTanzanian Shilling,TZS,0.0004644,2243.16\nUkraine Hryvnia,UAH,0.04004,25.5139\nUganda Shilling,UGX,0.0002999,3415.53\nUS Dollar,USD,1,1\nUruguayan Peso,UYU,0.03249,31.8608\nUzbekistan Som,UZS,0.0003438,2979\nVenezuelan Bolivar,VEB,0.0001002,10000\nVenezuelan Bolivar Fuerte,VEF,0.1002,10\nVietnamese Dong,VND,4.516e-05,22781.1\nVanuatu Vatu,VUV,0.009112, 111.75 \nSamoan Tala,WST,0.4407,2.3602\nCFA Franc BEAC,XAF,0.001696,589.729\nSilver (oz.),XAG,16.027,0.06249\nGold (oz.),XAU,1206.22,0.0008293\nEast Caribbean Dollar,XCD,0.372,2.7169\nECU,XEU,1.1125, 0.899 \nCFA Franc BCEAO,XOF,0.001696, 589.715 \nPalladium (oz.),XPD,544.912,0.001845\nCFP Franc,XPF,0 .009326,107.224\nPlatinum (oz.),XPT,977.5,0.001034\nYemeni Rial,YER,0.004022,248.75\nYugoslav Dinar,YUN,0.009061,111.067\nSouth African Rand,ZAR,0.0634,15.7938\nZambian Kwacha,ZMK,0.0001932,5328.9\nZambian  Kwacha,ZMW,0.09643,10.46\nZimbabwe Dollar,ZWD,0.002679,376.3";
    }
});
