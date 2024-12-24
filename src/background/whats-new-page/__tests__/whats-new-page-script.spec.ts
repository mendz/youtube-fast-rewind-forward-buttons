import { MOCK_HTML } from '../__utils__/whats-new-page-tests-helper';
import { getDate, renderUpdate, setUpdates } from '../whats-new-page-script';

describe('Updates page', () => {
  beforeEach(() => {
    document.body.innerHTML = MOCK_HTML;
  });

  describe('getDate()', () => {
    it('Should return the correct date', () => {
      const date = getDate('2024-08-13');
      expect(date).toBe('13 August 2024');
    });
  });

  describe('setUpdates()', () => {
    it('should not update the DOM if there are no updates', () => {
      setUpdates([]);

      const updatesElement = document.getElementById('updates');
      expect(updatesElement?.innerHTML?.length).toBe(0);
    });

    it('should update the DOM element if there are updates', () => {
      const titleToCheck = 'Lorem ut incididunt pariatur do.';
      const descToCheck =
        'Quis voluptate do sit laboris enim proident esse esse';
      const versionToTest = '0.0.0';
      const dateToTest = 'DATE';

      const mockVersionUpdates = [
        {
          version: versionToTest,
          date: dateToTest,
          updates: [
            {
              title: titleToCheck,
              description: descToCheck,
            },
            {
              title:
                'Veniam officia et aute esse sint culpa in id in eiusmod ipsum dolor consectetur ea.',
              description: `Sit ad anim enim cillum.`,
            },
          ],
        },
      ];

      setUpdates(mockVersionUpdates);

      const updatesElement = document.getElementById('updates');
      const firstCard = updatesElement?.querySelector('div.card');

      expect(updatesElement?.innerHTML?.length).not.toBe(0);
      expect(updatesElement?.querySelectorAll('h3.version-date')?.length).toBe(
        1
      );
      expect(
        updatesElement?.querySelector('h3.version-date')?.textContent
      ).toMatch(`${versionToTest} - ${dateToTest}`);
      expect(updatesElement?.querySelectorAll('div.card')?.length).toBe(2);
      expect(firstCard?.querySelector('h3')?.textContent).toBe(titleToCheck);
      expect(firstCard?.querySelector('p')?.textContent).toBe(descToCheck);
    });
  });

  describe('renderUpdate', () => {
    it('should return the cards HTML correctly', () => {
      const titleToCheck = 'Lorem ut incididunt pariatur do.';
      const descToCheck =
        'Quis voluptate do sit laboris enim proident esse esse';

      const mockUpdate = {
        title: titleToCheck,
        description: descToCheck,
      };

      const result = renderUpdate(mockUpdate);
      expect(result).toMatch(`<h3>${titleToCheck}</h3>`);
      expect(result).toMatch(`<p>${descToCheck}</p>`);
    });
  });
});
