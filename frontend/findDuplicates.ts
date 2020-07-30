export const findDuplicates = (array: any[]) => {
  const sortedArray = array.slice().sort() // You can define the comparing function here.

  let results = []
  for (let i = 0; i < sortedArray.length - 1; i++) {
    if (sortedArray[i + 1] == sortedArray[i]) {
      results.push(sortedArray[i])
    }
  }
  return results
}
