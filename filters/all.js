const filter = module.exports;
const _ = require('lodash');
const TemplateUtil = require('../lib/templateUtil');
const templateUtil = new TemplateUtil();

const typeMap = new Map()
typeMap.set('boolean', 'Boolean')
typeMap.set('integer', 'Integer')
typeMap.set('number', 'Double')
typeMap.set('string', 'String')

const formatMap = new Map()
formatMap.set('boolean', '%s')
formatMap.set('enum', '%s')
formatMap.set('integer', '%d')
formatMap.set('number', '%f')
formatMap.set('string', '%s')

function artifactId([info, params]) {
  let ret = ''
  if (params['artifactId']) {
    ret = params['artifactId']
  } else if (info.extensions()['x-artifact-id']) {
    ret = info.extensions()['x-artifact-id']
  } else if (info.title()) {
    ret = _.kebabCase(info.title())
  } else {
    throw new Error("Can't determine the artifact id. Please set the param artifactId, or element info.title or info.x-artifact-id.")
  }
  return ret
}
filter.artifactId = artifactId;

function bindingClassName([channelName, channel]) {
  let className = channel.json()['x-java-class']
  if (!className) {
    throw new Error("Please set the x-java-class property on the channel " + channelName);
  }

  return _.upperFirst(className) + "Binding";
}
filter.bindingClassName = bindingClassName;

function contentType(channel) {

  //console.log("contentType start")
  let ret;

  if (channel.hasPublish()) {
    ret = getContentType(channel.publish())
  }
  if (!ret && channel.hasSubscribe()) {
    ret = getContentType(channel.subscribe())
  }

  //console.log("contentType " + ret)
  return ret
}
filter.contentType = contentType;

function deliveryMode(channel) {
  let val = null; // TODO fix me. channel.publish()._json.bindings.solace.deliveryMode
  if (!val) {
    ret = 'DIRECT'
  } else {
    ret = _.upperCase(val)
    if (ret != 'DIRECT' && ret != 'PERSISTENT') {
      throw new Error("delivery mode must be direct or persistent. Found: " + val)
    }
  }

  return ret;
}
filter.deliveryMode = deliveryMode;

function getContentType(pubOrSub) {
  return pubOrSub._json.message.contentType
}

function indent1(numTabs) {
  return indent(numTabs)
}
filter.indent1 = indent1;

function indent2(numTabs) {
  return indent(numTabs + 1)
}
filter.indent2 = indent2;

function indent3(numTabs) {
  return indent(numTabs + 2)
}
filter.indent3 = indent3;

function fixType([name, property]) {

  // For message headers, type is a property.
  // For schema properties, type is a function.
  let type = property.type

  if (typeof type == "function") {
    type = property.type()
  }

  // console.log('fixType: ' + name + ' ' + type + ' ' + dump(property._json) + ' ' )

  // If a schema has a property that is a ref to another schema,
  // the type is undefined, and the title gives the title of the referenced schema.
  let ret
  if (type === undefined) {
    if (property._json.enum) {
      ret = _.upperFirst(name)
    } else {
      ret = property.title()
    }
  } else if (type === 'array') {
    let itemsType = property._json.items.type
    if (itemsType) {
      itemsType = typeMap.get(itemsType)
      if (!itemsType) {
        throw new Error("Can't determine the type of the array property " + name)
      }
    }
    if (!itemsType) {
      itemsType = property._json.items.title
      if (!itemsType) {
        throw new Error("Can't determine the type of the array property " + name)
      }
    }
    //console.log('array: ' + title)
    ret = _.upperFirst(itemsType) + "[]"
  } else if (type === 'object') {
    ret = _.upperFirst(name)
  } else {
    ret = typeMap.get(type)
    if (!ret) {
      ret = type
    }
  }
  return ret
}
filter.fixType = fixType;

function groupId([info, params]) {
  let ret = ''
  if (params['groupId']) {
    ret = params['groupId']
  } else if (info.extensions()['x-group-id']) {
    ret = info.extensions()['x-group-id']
  } else {
    throw new Error("Can't determine the group id. Please set the param groupId or element info.x-group-id.")
  }
  return ret
}
filter.groupId = groupId;

function channelClass([channelName, channel]) {
  return templateUtil.getChannelClass(channelName, channel);
}

this.channelClass = channelClass;

function messageClass([channelName, channel]) {
  let ret = getMessageClass(channel.publish())
  if (!ret) {
    ret = getMessageClass(channel.subscribe())
  }
  if (!ret) {
    throw new Error("Channel " + channelName + ": no message class has been defined.")
  }
  return ret
}
this.messageClass = messageClass;

function payloadClass([channelName, channel]) {
  let ret = getPayloadClass(channel.publish())
  if (!ret) {
    ret = getPayloadClass(channel.subscribe())
  }
  if (!ret) {
    throw new Error("Channel " + channelName + ": no payload class has been defined.")
  }
  return ret
}
filter.payloadClass = payloadClass;

function queueInfo([channelName, channel, subscribeTopic]) {
  let ret = {}
  ret.isQueue = false;
  const bindings = channel._json.bindings
  if (bindings) {
    console.log("bindings: " + JSON.stringify(bindings))
    const solaceBinding = bindings.solace
    if (solaceBinding) {
      ret.isQueue = solaceBinding.is === 'queue'
      if (!ret.isQueue && solaceBinding.queue && !solaceBinding.queue.name) {
        throw new Exception("Channel " + channelName + " please provide a queue name.");
      }
      ret.needQueue = ret.isQueue || solaceBinding.queue.name
      ret.queueName = solaceBinding.queue && solaceBinding.queue.name ? solaceBinding.queue.name : channelName
      ret.accessType = solaceBinding.queue && solaceBinding.queue.exclusive ? "ACCESSTYPE_EXCLUSIVE" : "ACCESSTYPE_NONEXCLUSIVE"
      if (solaceBinding.queue && solaceBinding.queue.subscription) {
        ret.subscription = solaceBinding.queue.subscription
      } else if (!ret.isQueue) {
        ret.subscription = subscribeTopic
      }
    }
  }
  //console.log("queueInfo: " + JSON.stringify(ret))
  return ret;
}
filter.queueInfo = queueInfo;

function seeProp([name, prop]) {
  //if (name == 'account') {
  //console.log("prop: " + name + " " + dump(prop) + "|" + prop.title() + " " + dump(prop._json))
  console.log("prop: " + name + " type: " + prop.type() + " title: " + prop.title())
  //}
}
filter.seeProp = seeProp;

function toJson(object) {
  return JSON.stringify(object)
}
filter.toJson = toJson;

function topicInfo([channelName, channel]) {
  const ret = {}
  let publishTopic = String(channelName)
  let subscribeTopic = String(channelName)
  const params = []
  let functionParamList = ""
  let functionArgList = ""
  let first = true

  //console.log("params: " + JSON.stringify(channel.parameters()))
  for (let name in channel.parameters()) {
    const nameWithBrackets = "{" + name + "}"
    const schema = channel.parameter(name)['_json']['schema']
    //console.log("schema: " + dump(schema))
    const type = schema.type
    const param = { "name": _.lowerFirst(name) }

    if (first) {
      first = false
    } else {
      functionParamList += ", "
      functionArgList += ", "
    }

    if (type) {
      //console.log("It's a type: " + type)
      const javaType = typeMap.get(type)
      if (!javaType) throw new Error("topicInfo filter: type not found in typeMap: " + type)
      param.type = javaType
      const printfArg = formatMap.get(type)
      //console.log("printf: " + printfArg)
      if (!printfArg) throw new Error("topicInfo filter: type not found in formatMap: " + type)
      //console.log("Replacing " + nameWithBrackets)
      publishTopic = publishTopic.replace(nameWithBrackets, printfArg)
    } else {
      const en = schema.enum
      if (en) {
        //console.log("It's an enum: " + en)
        param.type = _.upperFirst(name)
        param.enum = en
        //console.log("Replacing " + nameWithBrackets)
        publishTopic = publishTopic.replace(nameWithBrackets, "%s")
      } else {
        throw new Error("topicInfo filter: Unknown parameter type: " + JSON.stringify(schema))
      }
    }

    subscribeTopic = subscribeTopic.replace(nameWithBrackets, "*")
    functionParamList += param.type + " " + param.name
    functionArgList += param.name
    params.push(param)
  }
  ret.functionArgList = functionArgList
  ret.functionParamList = functionParamList
  ret.channelName = channelName
  ret.params = params
  ret.publishTopic = publishTopic
  ret.subscribeTopic = subscribeTopic
  return ret
}
filter.topicInfo = topicInfo;

function dump(obj) {
  let s = typeof obj
  for (let p in obj) {
    s += " "
    s += p
  }
  return s
}

function indent(numTabs) {
  return "\t".repeat(numTabs)
}

function getChannelClass(channel) {
  

}

function getMessageClass(pubOrSub) {

  let ret = null;

  //console.log('getMessageClass');
  //console.log(pubOrSub);

  if (pubOrSub ) {
    let message = pubOrSub.message();
    
    if (message) {
      ret = message.name();

      if (!ret) {
        ret = message.ext('x-parser-message-name');
      }
    }
  }

  return ret
}

function getPayloadClass(pubOrSub) {
  let ret

  if (pubOrSub && pubOrSub._json && pubOrSub._json.message && pubOrSub._json.message.payload) {
    ret = _.upperFirst(pubOrSub._json.message.payload.title)
  }

  return ret
}
