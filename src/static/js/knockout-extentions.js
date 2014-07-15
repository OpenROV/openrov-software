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
