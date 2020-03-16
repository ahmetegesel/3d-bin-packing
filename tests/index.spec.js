import {
  calculateAmountOfPackageToBePlaced,
  getAxisToDimensionMap,
  calculateRemainingGap,
  getDimensionOfAxis,
  createBin,
  createLayer,
  createColumn,
  getFirstColumn,
  getLastColumn,
  getFirstPlacedPackageOfColumn,
  getLastPlacedPackageOfColumn, createPackagePlaceReference, getWidthOfWidestPackageInColumn, sortPackageSamples
} from "../index";

describe('Room calculations', () => {
  test.each`
  originPackage               |   bin                 |   placingAxis   |   expectedGap
  ${{ width: 10, x: 0 }}      |   ${{ width: 50 }}    |   ${'x'}        |   ${40}
  ${{ depth: 5, y: 40 }}      |   ${{ depth: 50 }}    |   ${'y'}        |   ${5}
  ${{ height: 15, z: 15 }}    |   ${{ height: 50 }}   |   ${'z'}        |   ${20}
  ${{ width: 10, x: 50 }}     |   ${{ width: 50 }}    |   ${'x'}        |   ${-1}
  ${{ depth: 5, y: 48 }}      |   ${{ depth: 50 }}    |   ${'y'}        |   ${-1}
  ${{ height: 10, z: 45 }}    |   ${{ height: 50 }}   |   ${'z'}        |   ${-1}
  `('With given placingAxis, remainingGap should return expectedGap.', ({ originPackage, bin, placingAxis, expectedGap }) => {
    const result = calculateRemainingGap(originPackage, bin, placingAxis);

    expect(result).toBe(expectedGap);
  });

  test.each`
  remainingGap    |   packageToBePlaced   |   placingAxis   |   expectedAmount
  ${50}           |   ${{ width: 25 }}    |   ${'x'}        |   ${2}
  ${50}           |   ${{ depth: 2 }}     |   ${'y'}        |   ${25}
  ${50}           |   ${{ height: 10 }}   |   ${'z'}        |   ${5}
  ${50}           |   ${{ width: 20 }}    |   ${'x'}        |   ${2}
  ${50}           |   ${{ depth: 3 }}     |   ${'y'}        |   ${16}
  ${50}           |   ${{ height: 12 }}   |   ${'z'}        |   ${4}
  ${10}           |   ${{ width: 20 }}    |   ${'x'}        |   ${0}
  ${1}            |   ${{ depth: 3 }}     |   ${'y'}        |   ${0}
  ${10}           |   ${{ height: 12 }}   |   ${'z'}        |   ${0}
  `('With given placingAxis, calculateAmountOfPackageToBePlaced should return expectedAmount.', ({ remainingGap, packageToBePlaced, placingAxis, expectedAmount }) => {
    const result = calculateAmountOfPackageToBePlaced(remainingGap, packageToBePlaced, placingAxis);

    expect(result).toBe(expectedAmount);
  });
});

describe('Axis Dimension Conversions', () => {
  test('getAxisToDimensionMap should return the map according to following order x:y:z -> width:depth:height', () => {
    const result = getAxisToDimensionMap();

    expect(result).toEqual({
      x: 'width',
      y: 'depth',
      z: 'height'
    });
  });

  const sampleObject = { width: 10, height: 20, depth: 30 };
  test.each`
  dimensionalObject     |   axis                  |   expectedValue
  ${sampleObject}       |   ${'x'}    |   ${sampleObject.width}
  ${sampleObject}       |   ${'y'}                |   ${sampleObject.depth}
  ${sampleObject}       |   ${'z'}                |   ${sampleObject.height}
  `('getDimensionOfAxis should return expected dimension according to the given axis.', ({ dimensionalObject, axis, expectedValue }) => {
    const result = getDimensionOfAxis(dimensionalObject, axis);

    expect(result).toBe(expectedValue);
  });
});

describe('Bin organizations', () => {
  test('createBin should return a bin that has the fields from given binSample.', () => {
    const binSample = { width: 60, height: 50, depth: 40 };

    const result = createBin(binSample);

    expect(result.width).toBe(binSample.width);
    expect(result.height).toBe(binSample.height);
    expect(result.depth).toBe(binSample.depth);
    expect(result.layers.length).toBe(1);
  });

  test('createBin should return a bin that has an initial layer.', () => {
    const result = createBin({});

    expect(result.layers.length).toBe(1);
  });

  test('createLayer should return a layer that has an initial column.', () => {
    const result = createLayer();

    expect(result.columns.length).toBe(1);
  });

  test('createColumn should return a column with an empty packageReferences.', () => {
    const result = createColumn();

    expect(result.packageReferences.length).toBe(0);
  });

  test('getFirstColumn should return the first column of the given layer.', () => {
    const sampleColumn1 = { packageReferences: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 50, z: 0 }] };
    const sampleColumn2 = { packageReferences: [{ x: 20, y: 0, z: 0 }, { x: 20, y: 50, z: 0 }] };
    const layer = { columns: [sampleColumn1, sampleColumn2] }
    const result = getFirstColumn(layer);

    expect(result).toEqual(sampleColumn1);
  });

  test('getLastColumn should return the last column of the given layer.', () => {
    const sampleColumn1 = { packageReferences: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 50, z: 0 }] };
    const sampleColumn2 = { packageReferences: [{ x: 20, y: 0, z: 0 }, { x: 20, y: 50, z: 0 }] };
    const layer = { columns: [sampleColumn1, sampleColumn2] }
    const result = getLastColumn(layer);

    expect(result).toEqual(sampleColumn2);
  });

  test('getFirstPlacedPackageOfColumn should return the first placed package reference of the given column.', () => {
    const packageReference1 = { x: 0, y: 0, z: 0 };
    const packageReference2 = { x: 0, y: 50, z: 0 };
    const column = { packageReferences: [packageReference1, packageReference2] }
    const result = getFirstPlacedPackageOfColumn(column);

    expect(result).toEqual(packageReference1);
  });

  test('getFirstPlacedPackageOfColumn should return the last placed package reference of the given column.', () => {
    const packageReference1 = { x: 0, y: 0, z: 0 };
    const packageReference2 = { x: 0, y: 50, z: 0 };
    const column = { packageReferences: [packageReference1, packageReference2] }
    const result = getLastPlacedPackageOfColumn(column);

    expect(result).toEqual(packageReference2);
  });

  test('createPackagePlaceReference should return package reference that has the same width, height and depth with the given packageSample.', () => {
    const packageSample = { width: 10, height: 20, depth: 30 };
    const position = { x: 0, y: 0, z: 0 };
    const result = createPackagePlaceReference(packageSample, position);

    expect(result.width).toEqual(packageSample.width);
    expect(result.height).toEqual(packageSample.height);
    expect(result.depth).toEqual(packageSample.depth);
  });

  test('createPackagePlaceReference should return package reference that has the same x, y and z with the given position parameter.', () => {
    const packageSample = { width: 10, height: 20, depth: 30 };
    const position = { x: 0, y: 0, z: 0 };
    const result = createPackagePlaceReference(packageSample, position);

    expect(result.x).toEqual(position.x);
    expect(result.y).toEqual(position.y);
    expect(result.z).toEqual(position.z);
  });


  const column1 = {packageReferences: [{width: 20}, {width: 30}]};
  const column2 = {packageReferences: [{width: 20}, {width: 10}]};
  const column3 = {packageReferences: [{width: 20}, {width: 10}, {width: 50}]};
  const column4 = {packageReferences: [{width: 10}]};
  const column5 = {packageReferences: []};

  test.each`
  column        |   initialValue          |   expectedWidth 
  ${column1}    |   ${0}      |   ${30}        
  ${column2}    |   ${0}                  |   ${20}        
  ${column3}    |   ${0}                  |   ${50}        
  ${column4}    |   ${0}                  |   ${10}        
  ${column5}    |   ${100}                |   ${100}        
  `('getWidthOfWidestPackageInColumn should return expected value of width according to the given column.', ({ column, initialValue, expectedWidth }) => {
    const result = getWidthOfWidestPackageInColumn(column, initialValue);

    expect(result).toEqual(expectedWidth);
  });

  test('sortPackageSamples should sort given packageSamples by first height then width.', () => {
    let packageSample1 = {
      width: 20,
      height: 23
    };

    let packageSample2 = {
      width: 22,
      height: 26
    };

    let packageSample3 = {
      width: 14,
      height: 25
    };

    const result = sortPackageSamples([packageSample1,packageSample2,packageSample3]);

    expect(result[0]).toBe(packageSample2);
    expect(result[1]).toBe(packageSample3);
    expect(result[2]).toBe(packageSample1);
  });
});
