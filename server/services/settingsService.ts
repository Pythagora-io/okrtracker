import Settings, { ISettings } from '../models/Settings';

interface UpdateSettingsData {
  dayOfWeek?: number;
  hour?: number;
  minute?: number;
  timezone?: string;
}

class SettingsService {
  static async get(): Promise<ISettings> {
    try {
      console.log('Fetching automation settings');

      // Get or create settings (singleton pattern)
      let settings = await Settings.findOne();

      if (!settings) {
        console.log('No settings found, creating default settings');
        settings = new Settings({
          dayOfWeek: 1, // Monday
          hour: 9,
          minute: 0,
          timezone: 'UTC',
        });
        await settings.save();
        console.log('Created default automation settings');
      } else {
        console.log('Successfully fetched automation settings');
      }

      return settings;
    } catch (err) {
      console.error('Error getting settings:', err);
      throw new Error(`Database error while getting settings: ${err}`);
    }
  }

  static async update(data: UpdateSettingsData): Promise<ISettings> {
    try {
      console.log('Updating automation settings with data:', data);

      // Validate data
      if (data.dayOfWeek !== undefined && (data.dayOfWeek < 0 || data.dayOfWeek > 6)) {
        throw new Error('dayOfWeek must be between 0 (Sunday) and 6 (Saturday)');
      }
      if (data.hour !== undefined && (data.hour < 0 || data.hour > 23)) {
        throw new Error('hour must be between 0 and 23');
      }
      if (data.minute !== undefined && (data.minute < 0 || data.minute > 59)) {
        throw new Error('minute must be between 0 and 59');
      }

      // Get or create settings
      let settings = await Settings.findOne();

      if (!settings) {
        console.log('No settings found, creating new settings');
        settings = new Settings({
          dayOfWeek: data.dayOfWeek ?? 1,
          hour: data.hour ?? 9,
          minute: data.minute ?? 0,
          timezone: data.timezone ?? 'UTC',
        });
      } else {
        // Update existing settings
        if (data.dayOfWeek !== undefined) settings.dayOfWeek = data.dayOfWeek;
        if (data.hour !== undefined) settings.hour = data.hour;
        if (data.minute !== undefined) settings.minute = data.minute;
        if (data.timezone !== undefined) settings.timezone = data.timezone;
      }

      await settings.save();

      console.log('Successfully updated automation settings');
      return settings;
    } catch (err) {
      console.error('Error updating settings:', err);
      throw new Error(`Database error while updating settings: ${err}`);
    }
  }
}

export default SettingsService;
