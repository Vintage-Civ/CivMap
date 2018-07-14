import { createStore } from 'redux'

import { loadAppStateFromUrlData } from './importExport'
import { processCollectionFile } from './importFile'
import murmurhash3 from './murmurhash3_gc'
import { combinedReducers } from '../store'

jest.mock('./net')

// @ts-ignore
import { __setMockGetJson } from './net'

describe("loadAppStateFromUrlData", () => {
  it("imports url feature data to url_import collection", () => {
    const store = createStore(combinedReducers)
    const feature = { x: -123, z: 123 }

    loadAppStateFromUrlData({ feature: { ...feature } }, store)

    const generatedFeatureId = murmurhash3(JSON.stringify(feature), 1)
    const source = 'civmap:url_import'

    expect(store.getState().collections).toHaveProperty([source])
    const collection = store.getState().collections[source]
    expect(Object.values(collection.features)[0]).toEqual({ ...feature, id: generatedFeatureId, source: source })
  })

  it("imports collection from url", () => {
    const store = createStore(combinedReducers)
    const feature = { id: 'feature_id', x: -123, z: 123 }
    __setMockGetJson({
      info: { version: '0.3.3' },
      features: [{ ...feature }],
    })
    const collectionUrl = 'test://url.please/ignore'

    loadAppStateFromUrlData({ collectionUrl }, store)

    expect(store.getState().collections).toHaveProperty([collectionUrl])
    const collection = store.getState().collections[collectionUrl]
    expect(collection.features).toHaveProperty([feature.id])
    expect(collection.features[feature.id]).toEqual({ ...feature, source: collectionUrl })
  })
})

describe("processCollectionFile", () => {
  it("imports collection from file", () => {
    const store = createStore(combinedReducers)
    const feature = { id: 'feature_id', x: -123, z: 123 }
    const collectionJson = JSON.stringify({
      info: { version: '0.3.3' },
      features: [{ ...feature }],
    })
    const fileName = 'test.civmap.json'
    const collectionFile = new File([collectionJson], fileName)

    return processCollectionFile(collectionFile, store.dispatch).then(() => {
      const cid = `civmap:collection/file/${fileName}`
      expect(store.getState().collections).toHaveProperty([cid])
      const collection = store.getState().collections[cid]
      expect(collection.features).toHaveProperty([feature.id])
      expect(collection.features[feature.id]).toEqual({ ...feature, source: cid })
    })
  })
})