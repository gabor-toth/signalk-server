# Working with the Resources API


## Overview

The SignalK specification defines a number of resources (routes, waypoints, notes, regions & charts) each with its own path under the root `resources` path _(e.g. `/signalk/v2/api/resources/routes`)_.

The SignalK server validates requests to these resource paths and passes them to a [Resource Provider plugin](RESOURCE_PROVIDER_PLUGINS.md) for storage and retrieval. 

 _You can find plugins in the `App Store` section of the server admin UI._

Client applications can then use `HTTP` requests to these paths to store (`POST`, `PUT`), retrieve (`GET`) and remove (`DELETE`) resource entries. 

_Note: the ability to store resource entries is controlled by the server security settings so client applications may need to authenticate for write / delete operations to complete successfully._


### Retrieving Resources
---

Resource entries are retrived by submitting an HTTP `GET` request to the relevant path.

For example to return a list of all available routes
```typescript
HTTP GET 'http://hostname:3000/signalk/v2/api/resources/routes'
```
 or alternatively fetch a specific route.
```typescript
HTTP GET 'http://hostname:3000/signalk/v2/api/resources/routes/94052456-65fa-48ce-a85d-41b78a9d2111'
```

A filtered list of entries can be retrieved based on criteria such as:

- being within a bounded area
- distance from vessel
- total entries returned

by supplying a query string containing `key | value` pairs in the request.

_Example 1: Retrieve waypoints within 50km of the vessel. Note: distance in meters value should be provided._

```typescript
HTTP GET 'http://hostname:3000/signalk/v2/api/resources/waypoints?distance=50000'
```

_Example 2: Retrieve up to 20 waypoints within 90km of the vessel._

```typescript
HTTP GET 'http://hostname:3000/signalk/v2/api/resources/waypoints?distance=90000&limit=20'
```

_Example 3: Retrieve waypoints within a bounded area. Note: the bounded area is supplied as bottom left & top right corner coordinates in the form swLongitude,swLatitude,neLongitude,neLatitude_.

```typescript
HTTP GET 'http://hostname:3000/signalk/v2/api/resources/waypoints?bbox=[-135.5,38,-134,38.5]'
```


### Deleting Resources
---

Resource entries are deleted by submitting an HTTP `DELETE` request to a path containing the `id` of the resource to delete.

_Example: Delete from storage the route with id `94052456-65fa-48ce-a85d-41b78a9d2111`._

```typescript
HTTP DELETE 'http://hostname:3000/signalk/v2/api/resources/routes/94052456-65fa-48ce-a85d-41b78a9d2111'
```


### Creating / updating Resources
---

__Creating a new resource entry:__

Resource entries are created by submitting an HTTP `POST` request to a path for the relevant resource type. 

```typescript
HTTP POST 'http://hostname:3000/signalk/v2/api/resources/routes' {resource_data}
```

The new resource is created and its `id` (generated by the server) is returned in the response message.

```JSON
{
  "state": "COMPLETED",
  "statusCode": 200,
  "id": "94052456-65fa-48ce-a85d-41b78a9d2111"
}
```

_Note: Each `POST` will generate a new `id` so if the resource data remains the same duplicate resources will be created._

__Updating a resource entry:__

Resource entries are updated by submitting an HTTP `PUT` request to a path for the relevant resource type that includes the resource `id`.

```typescript
HTTP PUT 'http://hostname:3000/signalk/v2/api/resources/waypoints/94052456-65fa-48ce-a85d-41b78a9d2111'
```

As the `PUT` request replaces the record with the supplied `id`,  the submitted resource data should contain a complete record for the resource type being written.

Each resource type has a specific set of attributes that are required to be supplied before the resource entry can be created or updated.

If either the submitted resource data or the resource id are invalid then the operation is aborted._

_Note: the submitted resource data is validated against the OpenApi schema definition for the relevant resource type._


---
## Multiple Providers for a Resource Type

The ResourcesAPI will allow for multiple plugins to register as a provider fo a resource type.

When this scenario occurs the server services request in the following ways:

__Listing entries:__

When a list of resources is requested 

_for example:_
```typescript
HTTP GET 'http://hostname:3000/signalk/v2/api/resources/waypoints'
```

each registered provider will be asked to return matching entries and the server aggregates the results and returns them to the client.

---

__Requests for specific resources:__

When a request is received for a specific resource 

_for example:_
```typescript
HTTP GET 'http://hostname:3000/signalk/v2/api/resources/waypoints/94052456-65fa-48ce-a85d-41b78a9d2111'

HTTP PUT 'http://hostname:3000/signalk/v2/api/resources/waypoints/94052456-65fa-48ce-a85d-41b78a9d2111'

HTTP DELETE 'http://hostname:3000/signalk/v2/api/resources/waypoints/94052456-65fa-48ce-a85d-41b78a9d2111'
```

each registered provider will polled to determine which one owns the entry with the supplied id. The provider with the resource entry is then the target of the requested operation (`getResource()`, `setResource()`, `deleteResource()`).

---

__Creating new resource entries:__

When a request is received to create a new resource 

_for example:_
```typescript
HTTP POST 'http://hostname:3000/signalk/v2/api/resources/waypoints'
```

the first provider that was registered for that resource type will be the target of the requested operation (`setResource()`).

---

__Specifying the resource provider to be the tartet of the request:__

When multiple providers are registered for a resource type the client can specify which provider should be the target of the request by using the query parameter `provider`.

_Example:_
```typescript
HTTP GET 'http://hostname:3000/signalk/v2/api/resources/waypoints?provider=provider-plugin-id'

HTTP GET 'http://hostname:3000/signalk/v2/api/resources/waypoints/94052456-65fa-48ce-a85d-41b78a9d2111?provider=provider-plugin-id'

HTTP PUT 'http://hostname:3000/signalk/v2/api/resources/waypoints/94052456-65fa-48ce-a85d-41b78a9d2111?provider=provider-plugin-id'

HTTP DELETE 'http://hostname:3000/signalk/v2/api/resources/waypoints/94052456-65fa-48ce-a85d-41b78a9d2111?provider=provider-plugin-id'

HTTP POST 'http://hostname:3000/signalk/v2/api/resources/waypoints?provider=provider-plugin-id'
```

the value assigned to `provider` is the `plugin id` of the resource provider plugin.

The plugin id can be obtained from the Signal K server url `http://hostname:3000/plugins`.

_Example:_

```typescript
HTTP GET 'http://hostname:3000/plugins'
```

```JSON
[
  {
    "id": "sk-resources-fs",  // <-- plugin id
    "name": "Resources Provider",
    "packageName": "sk-resources-fs",
    "version": "1.3.0",
    ...
  },
  ...
]
```
