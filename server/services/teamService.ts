import Team, { ITeam } from '../models/Team';
import User from '../models/User';
import mongoose from 'mongoose';

interface CreateTeamData {
  name: string;
  managerId: string;
  icIds: string[];
}

interface UpdateTeamData {
  name?: string;
  managerId?: string;
  icIds?: string[];
}

class TeamService {
  static async list(): Promise<ITeam[]> {
    try {
      console.log('Fetching all teams from database');
      const teams = await Team.find()
        .populate('managerId', 'email name role')
        .populate('icIds', 'email name role teamId')
        .exec();
      console.log(`Successfully fetched ${teams.length} teams`);
      return teams;
    } catch (err) {
      console.error('Error listing teams:', err);
      throw new Error(`Database error while listing teams: ${err}`);
    }
  }

  static async get(id: string): Promise<ITeam | null> {
    try {
      console.log(`Fetching team with ID: ${id}`);
      const team = await Team.findById(id)
        .populate('managerId', 'email name role')
        .populate('icIds', 'email name role teamId')
        .exec();
      if (team) {
        console.log(`Successfully fetched team: ${team.name}`);
      } else {
        console.log(`Team with ID ${id} not found`);
      }
      return team;
    } catch (err) {
      console.error(`Error getting team ${id}:`, err);
      throw new Error(`Database error while getting team: ${err}`);
    }
  }

  static async getByManager(managerId: string): Promise<ITeam[]> {
    try {
      console.log(`Fetching teams for manager ID: ${managerId}`);
      const teams = await Team.find({ managerId: new mongoose.Types.ObjectId(managerId) })
        .populate('managerId', 'email name role')
        .populate('icIds', 'email name role teamId')
        .exec();
      console.log(`Successfully fetched ${teams.length} teams for manager ${managerId}`);
      teams.forEach(team => {
        console.log(`Team ${team.name}: ${team.icIds?.length || 0} ICs`, team.icIds);
      });
      return teams;
    } catch (err) {
      console.error(`Error getting teams for manager ${managerId}:`, err);
      throw new Error(`Database error while getting teams by manager: ${err}`);
    }
  }

  static async create({ name, managerId, icIds }: CreateTeamData): Promise<ITeam> {
    if (!name) throw new Error('Team name is required');
    if (!managerId) throw new Error('Manager ID is required');

    try {
      console.log(`Creating new team: ${name} with manager ${managerId}`);

      // Verify manager exists and has correct role
      const manager = await User.findById(managerId);
      if (!manager) {
        throw new Error('Manager not found');
      }
      if (manager.role !== 'manager' && manager.role !== 'admin') {
        throw new Error('User must have manager or admin role to be assigned as team manager');
      }

      // Verify all ICs exist and have IC role
      if (icIds && icIds.length > 0) {
        const ics = await User.find({ _id: { $in: icIds } });
        if (ics.length !== icIds.length) {
          throw new Error('One or more IC users not found');
        }
        const invalidICs = ics.filter(ic => ic.role !== 'ic');
        if (invalidICs.length > 0) {
          throw new Error('All team members must have IC role');
        }
      }

      const team = new Team({
        name,
        managerId: new mongoose.Types.ObjectId(managerId),
        icIds: icIds ? icIds.map(id => new mongoose.Types.ObjectId(id)) : [],
      });

      await team.save();

      // Update users' teamId
      if (icIds && icIds.length > 0) {
        await User.updateMany(
          { _id: { $in: icIds } },
          { $set: { teamId: team._id } }
        );
      }

      console.log(`Successfully created team: ${team.name} (ID: ${team._id})`);

      const populatedTeam = await Team.findById(team._id)
        .populate('managerId', 'email name role')
        .populate('icIds', 'email name role teamId')
        .exec();

      return populatedTeam!;
    } catch (err) {
      console.error('Error creating team:', err);
      throw new Error(`Database error while creating team: ${err}`);
    }
  }

  static async update(id: string, data: UpdateTeamData): Promise<ITeam | null> {
    try {
      console.log(`Updating team ${id} with data:`, data);

      const team = await Team.findById(id);
      if (!team) {
        throw new Error('Team not found');
      }

      // Verify manager if being updated
      if (data.managerId) {
        const manager = await User.findById(data.managerId);
        if (!manager) {
          throw new Error('Manager not found');
        }
        if (manager.role !== 'manager' && manager.role !== 'admin') {
          throw new Error('User must have manager or admin role');
        }
      }

      // Verify ICs if being updated
      if (data.icIds) {
        const ics = await User.find({ _id: { $in: data.icIds } });
        if (ics.length !== data.icIds.length) {
          throw new Error('One or more IC users not found');
        }
        const invalidICs = ics.filter(ic => ic.role !== 'ic');
        if (invalidICs.length > 0) {
          throw new Error('All team members must have IC role');
        }

        // Remove teamId from old ICs not in new list
        const oldIcIds = team.icIds.map(id => id.toString());
        const removedIcIds = oldIcIds.filter(id => !data.icIds!.includes(id));
        if (removedIcIds.length > 0) {
          await User.updateMany(
            { _id: { $in: removedIcIds } },
            { $unset: { teamId: 1 } }
          );
        }

        // Add teamId to new ICs
        await User.updateMany(
          { _id: { $in: data.icIds } },
          { $set: { teamId: team._id } }
        );
      }

      const updateData: Record<string, unknown> = {};
      if (data.name) updateData.name = data.name;
      if (data.managerId) updateData.managerId = new mongoose.Types.ObjectId(data.managerId);
      if (data.icIds) updateData.icIds = data.icIds.map(id => new mongoose.Types.ObjectId(id));

      const updatedTeam = await Team.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      )
        .populate('managerId', 'email name role')
        .populate('icIds', 'email name role teamId')
        .exec();

      console.log(`Successfully updated team ${id}`);
      return updatedTeam;
    } catch (err) {
      console.error(`Error updating team ${id}:`, err);
      throw new Error(`Database error while updating team: ${err}`);
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      console.log(`Deleting team ${id}`);

      const team = await Team.findById(id);
      if (!team) {
        throw new Error('Team not found');
      }

      // Remove teamId from all ICs
      await User.updateMany(
        { teamId: team._id },
        { $unset: { teamId: 1 } }
      );

      const result = await Team.deleteOne({ _id: id }).exec();
      const deleted = result.deletedCount === 1;

      if (deleted) {
        console.log(`Successfully deleted team ${id}`);
      } else {
        console.log(`Failed to delete team ${id}`);
      }

      return deleted;
    } catch (err) {
      console.error(`Error deleting team ${id}:`, err);
      throw new Error(`Database error while deleting team: ${err}`);
    }
  }
}

export default TeamService;
