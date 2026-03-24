import assert from 'node:assert/strict';
import test from 'node:test';

import { createCapabilityGrant, evaluateCapabilityAttempt } from '../src/index';

test('approved grants allow matching attempts inside the budget', () => {
    const grant = createCapabilityGrant({
        capability: 'container-run',
        status: 'approved',
        allowedRegistries: ['127.0.0.1:5001'],
        maxUsdCents: 500,
    });

    const decision = evaluateCapabilityAttempt(grant, {
        capability: 'container-run',
        registry: '127.0.0.1:5001',
        estimatedUsdCents: 300,
    });

    assert.equal(decision.allowed, true);
    assert.deepEqual(decision.reasons, []);
});

test('pending grants are blocked until the user approves them', () => {
    const grant = createCapabilityGrant({
        capability: 'wasm-run',
        status: 'pending',
        allowedRegistries: ['127.0.0.1:5001'],
    });

    const decision = evaluateCapabilityAttempt(grant, {
        capability: 'wasm-run',
        registry: '127.0.0.1:5001',
    });

    assert.equal(decision.allowed, false);
    assert.deepEqual(decision.reasons, ['grant-pending']);
});

test('disallowed registries are rejected', () => {
    const grant = createCapabilityGrant({
        capability: 'container-run',
        status: 'approved',
        allowedRegistries: ['127.0.0.1:5001'],
    });

    const decision = evaluateCapabilityAttempt(grant, {
        capability: 'container-run',
        registry: 'ghcr.io',
    });

    assert.equal(decision.allowed, false);
    assert.deepEqual(decision.reasons, ['registry-not-allowed']);
});

test('budget overruns are rejected', () => {
    const grant = createCapabilityGrant({
        capability: 'polar-project-create',
        status: 'approved',
        allowedRegistries: [],
        maxUsdCents: 200,
    });

    const decision = evaluateCapabilityAttempt(grant, {
        capability: 'polar-project-create',
        estimatedUsdCents: 300,
    });

    assert.equal(decision.allowed, false);
    assert.deepEqual(decision.reasons, ['budget-exceeded']);
});
