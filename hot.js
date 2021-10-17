var HotJS = (rootEl, documentRef) => {
  var _root = rootEl || document
  var _document = documentRef || document

  var hotElements = {};
  const target = {
    flush: (keys) => {
      keys.forEach((key) => {
        const item = hotElements[key];
        let element = _document.createElement(item.type);
        mergeDeep(element, item);
        renderTree(item, element);
        _root.getElementById(key).replaceWith(element);
      });
    },
  };

  const isObject = (item) => {
    return item && typeof item === "object" && !Array.isArray(item);
  };

  const mergeDeep = (target, ...sources) => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
      for (const key in source) {
        if (typeof source[key] === 'function' && (key === 'className' || key === 'style')) {
          if (key === 'style') {
            if (!target[key]) Object.assign(target, { [key]: {} });
            mergeDeep(target[key], source[key]() );
          } else {
            Object.assign(target, { [key]: source[key]() });
          }
        } else if (isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return mergeDeep(target, ...sources);
  };

  const renderTree = (child, element) => {
    if (typeof child === "function") {
      renderTree(child(), element);
    } else if (Array.isArray(child)) {
      child.forEach((c) => renderTree(c, element));
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      element.appendChild(child);
    } else if (typeof child === 'object') {
      renderTree(child.child, element);
    } else {
      element.innerHTML = `${child}`;
    }
  };

  const makeRenderer = (prop) => {
    return (child) => {
      var element = _document.createElement(prop);
      if (child != null) {
        if (isObject(child)) {
          if (child.id != null) {
            hotElements[child.id] = { type: prop, ...child };
          }

          mergeDeep(element, child);
        }

        renderTree(child, element);
      }

      return element;
    };
  };

  const handler = {
    get: function (target, prop, receiver) {
      if (target[prop] != null) {
        return target[prop];
      }

      return makeRenderer(prop);
    },
  };

  return new Proxy(target, handler);
};