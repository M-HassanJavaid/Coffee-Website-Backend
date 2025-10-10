function compareOptions(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  for (const opt1 of arr1) {

    let found = false

    for (const opt2 of arr2) {
        
        if (opt1.name === opt2.name && opt1.value === opt2.value) {
            found = true;
            break;
        }

    }

    if (!found) {
        return false
    }

  }

  return true
}

module.exports = {
    compareOptions
}