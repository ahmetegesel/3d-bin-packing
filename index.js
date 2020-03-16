let binSample = {
  width: 60,
  height: 60,
  depth: 60
};

let packageSample1 = {
  width: 16,
  height: 23,
  depth: 2,
  amount: 100
};

let packageSample2 = {
  width: 22,
  height: 26,
  depth: 2,
  amount: 120
};

let packageSample3 = {
  width: 14,
  height: 26,
  depth: 10,
  amount: 200
};


let packageSamples = [packageSample1, packageSample2, packageSample3].filter(packageSample => packageSample.amount > 0);
packageSamples = sortPackageSamples(packageSamples);

export function sortPackageSamples(packageSamples) {
  return packageSamples.sort((prev, next) => {
    const height1 = prev.height;
    const height2 = next.height;

    const width1 = prev.width;
    const width2 = next.width;

    if (height1 > height2) return -1;
    if (height1 < height2) return 1;
    if (width1 > width2) return -1;
    if (width1 < width2) return 1;
    return 0;
  });
}

export const AXIS = {
  x: 'x',
  y: 'y',
  z: 'z'
};

export function getAxisToDimensionMap() {
  return {
    x: 'width',
    y: 'depth',
    z: 'height'
  };
}

export function getDimensionOfAxis(dimensionalObject, axis) {
  return dimensionalObject[getAxisToDimensionMap()[axis]];
}

export function createBin(binSample) {
  return { ...binSample, layers: [createLayer()] };
}

export function createLayer() {
  return {
    columns: [createColumn()]
  };
}

export function createColumn() {
  return { packageReferences: [] };
}

export function getFirstColumn(layer) {
  const [firstColumn] = layer.columns.slice(0, 1);
  return firstColumn;
}

export function getLastColumn(layer) {
  const [lastColumn] = layer.columns.slice(-1);
  return lastColumn;
}

export function getFirstPlacedPackageOfColumn(column) {
  const [firstPlacedPackage] = column.packageReferences.slice(0, 1)
  return firstPlacedPackage;
}

export function getLastPlacedPackageOfColumn(column) {
  const [lastPlacedPackage] = column.packageReferences.slice(-1)
  return lastPlacedPackage;
}

export function calculateRemainingGap(originPackage, bin, placingAxis) {
  const totalSize = getDimensionOfAxis(bin, placingAxis);
  const startingPosition = originPackage[placingAxis] + getDimensionOfAxis(originPackage, placingAxis);

  const remainingGap = totalSize - startingPosition;

  return Math.max(-1, remainingGap);
}

export function calculateAmountOfPackageToBePlaced(remainingGap, packageToBePlaced, placingAxis) {
  return Math.floor(remainingGap / getDimensionOfAxis(packageToBePlaced, placingAxis));
}

export function createPackagePlaceReference(packageSample, position) {
  const { width, height, depth } = packageSample;

  return {
    width,
    height,
    depth,
    ...position
  }
}

export function getWidthOfWidestPackageInColumn(column, initialValue) {
  return column.packageReferences.reduce((highest, nextPackage) => nextPackage.width > highest ? nextPackage.width : highest, initialValue)
}

let bins = [];
let currentBinIndex = 0;

for (let currentPackageSample of packageSamples) {
  while (currentPackageSample.amount > 0) {
    let currentBin = bins[currentBinIndex];

    if (!currentBin) {
      currentBin = createBin(binSample);
      bins.push(currentBin);
    }

    let [currentLayer] = currentBin.layers.slice(-1);
    let originPackage = getLastPlacedPackageOfColumn(getLastColumn(currentLayer));
    let remainingGap = originPackage ? calculateRemainingGap(originPackage, currentBin, AXIS.y) : currentBin.depth;
    let fistPlacedPackagePosition;

    if (remainingGap < currentPackageSample.depth) {
      originPackage = getFirstPlacedPackageOfColumn(getLastColumn(currentLayer));
      remainingGap = calculateRemainingGap(originPackage, currentBin, AXIS.x);

      if (remainingGap < currentPackageSample.width) {
        originPackage = getFirstPlacedPackageOfColumn(getFirstColumn(currentLayer));
        remainingGap = calculateRemainingGap(originPackage, currentBin, AXIS.z);

        if (remainingGap < currentPackageSample.height) {
          currentBinIndex++;
          continue;
        }

        currentLayer = createLayer();
        currentBin.layers.push(currentLayer);

        fistPlacedPackagePosition = { x: 0, y: 0, z: originPackage.z + originPackage.height }; //new layer's first package
        remainingGap = currentBin.depth;
      } else {
        currentLayer.columns.push({ packageReferences: [] }); // create a new column in the current layer
        const widthOfWidestPackageInColumn = getWidthOfWidestPackageInColumn(getLastColumn(currentLayer), originPackage.width);
        fistPlacedPackagePosition = { x: originPackage.x + widthOfWidestPackageInColumn, y: 0, z: originPackage.z };
        remainingGap = currentBin.depth;
      }
    } else {
      if (originPackage) {
        fistPlacedPackagePosition = {
          x: originPackage.x,
          y: originPackage.y + originPackage.depth,
          z: originPackage.z
        };
      } else {
        fistPlacedPackagePosition = { x: 0, y: 0, z: 0 }; // very first package in the bin
      }
    }


    const lastColumn = getLastColumn(currentLayer);
    lastColumn.packageReferences.push(createPackagePlaceReference(currentPackageSample, fistPlacedPackagePosition));

    let amountOfPackageToBePlaced = calculateAmountOfPackageToBePlaced(remainingGap, currentPackageSample, AXIS.y);
    currentPackageSample.amount -= amountOfPackageToBePlaced;

    const lastPlacedPackagePosition = { ...fistPlacedPackagePosition };
    lastPlacedPackagePosition.y = (amountOfPackageToBePlaced - 1) * currentPackageSample.depth;

    lastColumn.packageReferences.push(createPackagePlaceReference(currentPackageSample, lastPlacedPackagePosition));
  }

  bins = bins.reverse();
  currentBinIndex = 0;
}

// console.log(JSON.stringify(bins));
console.log(bins.length);
