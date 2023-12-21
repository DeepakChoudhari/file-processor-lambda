import { extractFields } from '../src/index';
import { describe, test, expect } from '@jest/globals';

describe('extractFields', () => {
    test('should return customer instance with all fields', async () => {
        const line = '11,216E205d6eBb815,Carl,Schroeder,"Oconnell, Meza and Everett",Shannonville,Guernsey,637-854-0256x825,114.336.0784x788,kirksalas@webb.com,2021-10-20,https://simmons-hurley.com/';
        const customer = await extractFields(line);

        expect(customer).toBeDefined();
    });
});
