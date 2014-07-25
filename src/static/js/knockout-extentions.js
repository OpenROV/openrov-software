ko.validation.rules.isUnique = {
  validator: function (newVal, options, foo) {
    if (options.predicate && typeof options.predicate !== "function")
      throw new Error("Invalid option for isUnique validator. The 'predicate' option must be a function.");

    var array = options.array || options;
    var count = 0;
    ko.utils.arrayMap(ko.utils.unwrapObservable(array), function (existingVal) {
      if (equalityDelegate()(existingVal, newVal)) count++;
    });
    return count < 1;

    function equalityDelegate() {
      return options.predicate ? options.predicate : function (v1, v2) {
        return v1 === v2;
      };
    }
  },
  message: 'This value is a duplicate'
};

ko.bindingHandlers.fadeVisible = {
  init: function(element, valueAccessor) {
    // Initially set the element to be instantly visible/hidden depending on the value
    var value = valueAccessor();
    var itemValue = value;
    if (typeof value == "object") { // passing in parameters
      itemValue = value.item;
    }
    $(element).toggle(ko.utils.unwrapObservable(itemValue)); // Use "unwrapObservable" so we can handle values that may or may not be observable
  },
  update: function(element, valueAccessor) {
    // Whenever the value subsequently changes, slowly fade the element in or out
    var value = valueAccessor();
    var itemValue = value;
    var fadeIn = true;
    var fadeOut = true;
    if (typeof value == "object") { // passing in parameters
      itemValue = value.value;
      if ('fadeIn' in value) {
        fadeIn = value.fadeIn;
      }
      if ('fadeOut' in value) {
        fadeOut = value.fadeOut;
      }
    }
    if (ko.utils.unwrapObservable(itemValue)) {
      fadeIn ? $(element).fadeIn() : $(element).show();
    }
    else {
      fadeOut ? $(element).fadeOut() : $(element).hide();
    }
  }
};