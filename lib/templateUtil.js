// This contains functions taht are common to both the all.js filter and the post-process.js hook.
const _ = require('lodash');

class TemplateUtil {


  getChannelClass(channelName, channel) {
    let ret = channel.extensions()['x-java-class'];
    //console.log(`getChannelName name: ${channelName} ext: ${ret}`);
    //console.log(channel);
    if (!ret) {
      ret = this.getClassName(channelName);
    }

    //console.log(`getChannelClass ret: ${ret}`);
    return ret;
  }

  // This returns a valid Java class name.
  getClassName(name) {
    const ret = this.getIdentifierName(name);
    return _.upperFirst(ret);
  }

  // This returns a valid Java identifier name.
  getIdentifierName(name) {
    let ret = _.camelCase(name);

    if (TemplateUtil.reservedWords.has(ret)) {
      ret = `_${  ret}`;
    }

    return ret;
  }


  // This returns the value of a param, or specification extention if the param isn't set. 
  // If neither is set and the required flag is true, it throws an error.
  getParamOrExtension(info, params, paramName, extensionName, description, example, required) {
    let ret = '';
    if (params[paramName]) {
      ret = params[paramName];
    } else if (info.extensions()[extensionName]) {
      ret = info.extensions()[extensionName];
    } else if (required) {
      throw new Error(`Can't determine the ${description}. Please set the param ${paramName} or info.${extensionName}. Example: ${example}`);
    }
    return ret;
  }

  // This returns the value of a param, or specification extention if the param isn't set. 
  // If neither is set it returns defaultValue.
	getParamOrDefault(info, params, paramName, extensionName, defaultValue) {
		let ret = '';
		if (params[paramName]) {
			ret = params[paramName];
		} else if (info.extensions()[extensionName]) {
			ret = info.extensions()[extensionName];
		} else  {
			ret = defaultValue;
		}
		return ret;
	}

	/*
	By default, the 'view' is 'client', which means that when the doc says subscribe, we publish.
	By setting the view to 'provider', when the doc says subscribe, we subscribe.
	*/
	isProvidererView(info, params) {
		let view = this.getParamOrDefault(info, params, 'view', 'x-view', 'client');
		return view === 'provider'
  }
  
  /*
  See isProviderView above.
  This returns true if the operation should physically subscribe, based on the 'view' param.
  */
  isRealSubscriber(info, params, operation) {
    let isProvider = this.isProvidererView(info, params);
    let ret = (isProvider && operation.isSubscribe()) || (!isProvider && !operation.isSubscribe());
    console.log(`isRealSubscriber: isProvider: ${isProviderer} isSubscribe: ${operation.isSubscribe()}`);
    return ret;
  }

  getRealPublisher(info, params, channel) {
    let isProvider = this.isProvidererView(info, params);
    return isProvider ? channel.publish() : channel.subscribe();
  }

  getRealSubscriber(info, params, channel) {
    let isProvider = this.isProvidererView(info, params);
    return isProvider ? channel.subscribe() : channel.publish();
  }
}

// This is the set of Java reserved words, to ensure that we don't generate reserved words.
TemplateUtil.reservedWords = new Set();
TemplateUtil.reservedWords.add('abstract');
TemplateUtil.reservedWords.add('assert');
TemplateUtil.reservedWords.add('boolean');
TemplateUtil.reservedWords.add('break');
TemplateUtil.reservedWords.add('boolean');
TemplateUtil.reservedWords.add('byte');
TemplateUtil.reservedWords.add('case');
TemplateUtil.reservedWords.add('catch');
TemplateUtil.reservedWords.add('char');
TemplateUtil.reservedWords.add('class');
TemplateUtil.reservedWords.add('const');
TemplateUtil.reservedWords.add('continue');
TemplateUtil.reservedWords.add('default');
TemplateUtil.reservedWords.add('do');
TemplateUtil.reservedWords.add('double');
TemplateUtil.reservedWords.add('else');
TemplateUtil.reservedWords.add('enum');
TemplateUtil.reservedWords.add('extends');
TemplateUtil.reservedWords.add('final');
TemplateUtil.reservedWords.add('finally');
TemplateUtil.reservedWords.add('float');
TemplateUtil.reservedWords.add('for');
TemplateUtil.reservedWords.add('if');
TemplateUtil.reservedWords.add('goto');
TemplateUtil.reservedWords.add('implements');
TemplateUtil.reservedWords.add('import');
TemplateUtil.reservedWords.add('instalceof');
TemplateUtil.reservedWords.add('int');
TemplateUtil.reservedWords.add('interface');
TemplateUtil.reservedWords.add('long');
TemplateUtil.reservedWords.add('native');
TemplateUtil.reservedWords.add('new');
TemplateUtil.reservedWords.add('package');
TemplateUtil.reservedWords.add('private');
TemplateUtil.reservedWords.add('proteccted');
TemplateUtil.reservedWords.add('public');
TemplateUtil.reservedWords.add('return');
TemplateUtil.reservedWords.add('short');
TemplateUtil.reservedWords.add('static');
TemplateUtil.reservedWords.add('strictfp');
TemplateUtil.reservedWords.add('super');
TemplateUtil.reservedWords.add('switch');
TemplateUtil.reservedWords.add('syncronized');
TemplateUtil.reservedWords.add('this');
TemplateUtil.reservedWords.add('throw');
TemplateUtil.reservedWords.add('throws');
TemplateUtil.reservedWords.add('transient');
TemplateUtil.reservedWords.add('try');
TemplateUtil.reservedWords.add('void');
TemplateUtil.reservedWords.add('volatile');
TemplateUtil.reservedWords.add('while');

module.exports = TemplateUtil;
