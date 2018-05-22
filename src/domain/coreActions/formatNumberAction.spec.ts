import formatNumberAction from './formatNumberAction';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';

describe('formatNumberAction', () => {
    const action = formatNumberAction().action;
    const attrText = {id: 'test_attr', format: AttributeFormats.DATE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('formatNumber', async () => {
        expect(
            action(
                123456.781,
                {thousandsSeparator: ' ', decimalsSeparator: ',', decimals: 2, prefix: '=> ', suffix: ' €'},
                ctx
            )
        ).toBe('=> 123 456,78 €');
        expect(
            action(123456.786, {thousandsSeparator: ' ', decimalsSeparator: ',', decimals: 2, suffix: ' €'}, ctx)
        ).toBe('123 456,79 €');
        expect(action(123456.78, {thousandsSeparator: '.', decimalsSeparator: ',', decimals: 4}, ctx)).toBe(
            '123.456,7800'
        );
        expect(action('aaa', {}, ctx)).toBe('');
    });
});
